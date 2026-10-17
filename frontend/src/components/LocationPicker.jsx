import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  getGeocoderUrl,
  reverseGeocode,
  searchPunePlaces,
} from '../services/geocoding';
import 'leaflet/dist/leaflet.css';

export const PUNE_CENTER = [18.5204, 73.8567];
export const PUNE_ZOOM = 12;

const selectedMarkerIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function formatCoordinate(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(6) : '—';
}

function MapViewport({ mapRef }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    return () => {
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [map, mapRef]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function isSameQuery(left, right) {
  return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}

export default function LocationPicker({
  value = null,
  onChange,
  geocoderUrl = getGeocoderUrl(),
  debounceMs = 450,
}) {
  const mapRef = useRef(null);
  const searchRequestRef = useRef(0);
  const reverseRequestRef = useRef(0);
  const selectedQueryRef = useRef('');
  const [searchQuery, setSearchQuery] = useState(value?.address || '');
  const [searchResults, setSearchResults] = useState([]);
  const [searchState, setSearchState] = useState('idle');
  const [searchError, setSearchError] = useState('');
  const [addressState, setAddressState] = useState(value ? 'ready' : 'idle');
  const [addressError, setAddressError] = useState('');
  const [locationState, setLocationState] = useState('idle');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    setSearchQuery(value?.address || '');
    if (value?.address) {
      selectedQueryRef.current = value.address;
      setAddressState('ready');
    }
  }, [value?.address]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2 || isSameQuery(query, selectedQueryRef.current)) {
      setSearchResults([]);
      setSearchState('idle');
      setSearchError('');
      return undefined;
    }

    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchState('loading');
      setSearchError('');
      searchPunePlaces(query, { endpoint: geocoderUrl, signal: controller.signal })
        .then((results) => {
          if (searchRequestRef.current !== requestId) return;
          setSearchResults(results);
          setSearchState('ready');
        })
        .catch((error) => {
          if (controller.signal.aborted || searchRequestRef.current !== requestId) return;
          setSearchResults([]);
          setSearchState('error');
          setSearchError(error instanceof Error ? error.message : 'The location search failed.');
        });
    }, Math.max(0, debounceMs));

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [debounceMs, geocoderUrl, searchQuery]);

  const updateSelection = async ({ lat, lng, address = '' }) => {
    const nextValue = { lat, lng, address };
    const requestId = reverseRequestRef.current + 1;
    reverseRequestRef.current = requestId;
    selectedQueryRef.current = address;
    setAddressError('');
    setAddressState(address ? 'ready' : 'loading');
    setLocationError('');
    setLocationState('success');
    setSearchResults([]);
    setSearchState('idle');
    setSearchQuery(address);
    onChange?.(nextValue);

    if (address) return;

    const controller = new AbortController();
    try {
      const resolvedAddress = await reverseGeocode({ lat, lng }, {
        endpoint: geocoderUrl,
        signal: controller.signal,
      });
      if (reverseRequestRef.current !== requestId) return;
      if (resolvedAddress) {
        const resolvedValue = { lat, lng, address: resolvedAddress };
        selectedQueryRef.current = resolvedAddress;
        setSearchQuery(resolvedAddress);
        setAddressState('ready');
        onChange?.(resolvedValue);
      } else {
        setAddressState('error');
        setAddressError('We could not find an address for this point. The coordinates are still selected.');
      }
    } catch (error) {
      if (reverseRequestRef.current !== requestId) return;
      setAddressState('error');
      setAddressError(error instanceof Error ? error.message : 'The address lookup failed.');
    }
  };

  const handleMapClick = (coordinates) => {
    void updateSelection(coordinates);
  };

  const handleResultSelect = (result) => {
    void updateSelection(result);
  };

  const handleUseMyLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationState('error');
      setLocationError('Your browser does not support location access. You can choose a point on the map instead.');
      return;
    }

    setLocationState('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.setView([coords.latitude, coords.longitude], 15, { animate: true });
        void updateSelection({ lat: coords.latitude, lng: coords.longitude });
      },
      (error) => {
        setLocationState('error');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission was not granted. You can choose a point on the map instead.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('We could not get your location in time. Please try again or choose a point on the map.');
        } else {
          setLocationError('Your location could not be determined. Please try again or choose a point on the map.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleResetSelection = () => {
    reverseRequestRef.current += 1;
    selectedQueryRef.current = '';
    setSearchQuery('');
    setSearchResults([]);
    setSearchState('idle');
    setSearchError('');
    setAddressState('idle');
    setAddressError('');
    setLocationState('idle');
    setLocationError('');
    onChange?.(null);
  };

  const handleResetView = () => {
    mapRef.current?.setView(PUNE_CENTER, PUNE_ZOOM, { animate: true });
  };

  const hasSearchMessage = searchQuery.trim().length >= 2;

  return (
    <div className="location-picker">
      <div className="location-picker-search">
        <label htmlFor="location-search">Search for a place in Pune</label>
        <div className="location-search-input-wrap">
          <Search size={17} aria-hidden="true" />
          <input
            id="location-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              selectedQueryRef.current = '';
              setSearchQuery(event.target.value);
            }}
            placeholder="Road, landmark, neighbourhood…"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="location-search-results"
            aria-expanded={searchResults.length > 0}
          />
          {searchQuery && (
            <button
              type="button"
              className="location-clear-button"
              onClick={handleResetSelection}
              aria-label="Clear selected location"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchState === 'loading' && <p className="location-status" role="status">Searching Pune…</p>}
        {searchState === 'error' && <p className="location-error" role="alert">{searchError}</p>}
        {searchState === 'ready' && hasSearchMessage && searchResults.length === 0 && (
          <p className="location-status" role="status">No matching places found in Pune.</p>
        )}
        {searchResults.length > 0 && (
          <div id="location-search-results" className="location-search-results" role="listbox" aria-label="Pune location results">
            {searchResults.map((result) => (
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="location-search-result"
                key={result.id}
                onClick={() => handleResultSelect(result)}
              >
                <MapPin size={16} aria-hidden="true" />
                <span>{result.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="location-map-toolbar">
        <span className="location-map-hint">Click the map to place or move the marker.</span>
        <div className="location-map-actions">
          <button type="button" className="small-button outline-button" onClick={handleUseMyLocation} disabled={locationState === 'loading'}>
            <LocateFixed size={15} />
            {locationState === 'loading' ? 'Finding you…' : 'Use My Location'}
          </button>
          <button type="button" className="small-button outline-button" onClick={handleResetView}>
            <RotateCcw size={15} /> Reset Pune view
          </button>
          {value && (
            <button type="button" className="small-button location-reset-button" onClick={handleResetSelection}>
              <X size={15} /> Reset selection
            </button>
          )}
        </div>
      </div>

      <MapContainer
        className="location-map"
        center={PUNE_CENTER}
        zoom={PUNE_ZOOM}
        scrollWheelZoom
        aria-label="Interactive Pune location map"
      >
        <MapViewport mapRef={mapRef} />
        <MapClickHandler onMapClick={handleMapClick} />
        <TileLayer
          attribution="&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {value?.lat !== undefined && value?.lng !== undefined && (
          <Marker position={[value.lat, value.lng]} icon={selectedMarkerIcon} alt="Selected complaint location" />
        )}
      </MapContainer>

      {locationState === 'error' && <p className="location-error" role="alert">{locationError}</p>}

      <div className="location-selection" aria-live="polite">
        <div className="location-selection-icon"><MapPin size={17} /></div>
        <div>
          <span className="muted-label">SELECTED LOCATION</span>
          {value ? (
            <>
              <strong>{value.address || (addressState === 'loading' ? 'Looking up address…' : 'Address unavailable')}</strong>
              <span className="location-coordinates">{formatCoordinate(value.lat)}, {formatCoordinate(value.lng)}</span>
            </>
          ) : (
            <span className="location-empty">No map location selected yet.</span>
          )}
        </div>
      </div>
      {addressState === 'error' && <p className="location-error" role="alert">{addressError}</p>}
    </div>
  );
}
