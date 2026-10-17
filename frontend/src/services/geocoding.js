const DEFAULT_GEOCODER_URL = import.meta.env.VITE_GEOCODER_URL || 'https://nominatim.openstreetmap.org/search';

// The box is intentionally a little wider than Pune city so nearby civic areas
// can still be selected while unrelated results are kept out of the picker.
export const PUNE_BOUNDS = {
  south: 18.25,
  west: 73.55,
  north: 18.8,
  east: 74.25,
};

export const PUNE_VIEWBOX = `${PUNE_BOUNDS.west},${PUNE_BOUNDS.north},${PUNE_BOUNDS.east},${PUNE_BOUNDS.south}`;

function endpointUrl(endpoint, kind) {
  const parsed = new URL(endpoint || DEFAULT_GEOCODER_URL, window.location.origin);
  const suffix = `/${kind}`;

  if (parsed.pathname.endsWith('/search')) {
    parsed.pathname = parsed.pathname.slice(0, -'/search'.length) + suffix;
  } else if (parsed.pathname.endsWith('/reverse')) {
    parsed.pathname = parsed.pathname.slice(0, -'/reverse'.length) + suffix;
  } else {
    parsed.pathname = `${parsed.pathname.replace(/\/$/, '')}${suffix}`;
  }
  parsed.search = '';
  return parsed;
}

function toFiniteCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function isWithinPuneBounds(lat, lng) {
  return lat >= PUNE_BOUNDS.south
    && lat <= PUNE_BOUNDS.north
    && lng >= PUNE_BOUNDS.west
    && lng <= PUNE_BOUNDS.east;
}

function normalizeGeocoderResult(result) {
  const lat = toFiniteCoordinate(result?.lat);
  const lng = toFiniteCoordinate(result?.lon ?? result?.lng);
  const address = typeof result?.display_name === 'string' ? result.display_name.trim() : '';

  if (lat === null || lng === null || !address || !isWithinPuneBounds(lat, lng)) return null;

  return {
    id: String(result.place_id ?? `${lat}:${lng}`),
    address,
    lat,
    lng,
  };
}

async function readJson(response, fallbackMessage) {
  if (!response.ok) throw new Error(fallbackMessage);
  try {
    return await response.json();
  } catch {
    throw new Error('The location service returned an unreadable response.');
  }
}

/** Convert a picker value into the text expected by the existing complaint API. */
export function locationToText(location) {
  if (typeof location === 'string') return location.trim();
  if (!location || typeof location !== 'object') return '';

  if (typeof location.address === 'string' && location.address.trim()) {
    return location.address.trim();
  }

  const lat = toFiniteCoordinate(location.lat);
  const lng = toFiniteCoordinate(location.lng);
  return lat === null || lng === null ? '' : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function getGeocoderUrl() {
  return DEFAULT_GEOCODER_URL;
}

export async function searchPunePlaces(query, { endpoint = DEFAULT_GEOCODER_URL, signal } = {}) {
  const trimmedQuery = String(query || '').trim();
  if (!trimmedQuery) return [];

  const search = endpointUrl(endpoint, 'search');
  const scopedQuery = /\bpune\b/i.test(trimmedQuery)
    ? trimmedQuery
    : `${trimmedQuery}, Pune, Maharashtra, India`;
  search.searchParams.set('q', scopedQuery);
  search.searchParams.set('format', 'jsonv2');
  search.searchParams.set('addressdetails', '1');
  search.searchParams.set('limit', '5');
  search.searchParams.set('countrycodes', 'in');
  search.searchParams.set('viewbox', PUNE_VIEWBOX);
  search.searchParams.set('bounded', '1');

  const response = await fetch(search.toString(), {
    signal,
    headers: { Accept: 'application/json' },
  });
  const results = await readJson(response, 'The location search is unavailable right now.');
  if (!Array.isArray(results)) throw new Error('The location service returned an invalid response.');

  return results.map(normalizeGeocoderResult).filter(Boolean);
}

export async function reverseGeocode({ lat, lng }, { endpoint = DEFAULT_GEOCODER_URL, signal } = {}) {
  const latitude = toFiniteCoordinate(lat);
  const longitude = toFiniteCoordinate(lng);
  if (latitude === null || longitude === null) return null;

  const reverse = endpointUrl(endpoint, 'reverse');
  reverse.searchParams.set('lat', String(latitude));
  reverse.searchParams.set('lon', String(longitude));
  reverse.searchParams.set('format', 'jsonv2');
  reverse.searchParams.set('addressdetails', '1');
  reverse.searchParams.set('zoom', '18');

  const response = await fetch(reverse.toString(), {
    signal,
    headers: { Accept: 'application/json' },
  });
  const result = await readJson(response, 'The address lookup is unavailable right now.');
  const normalized = normalizeGeocoderResult({ ...result, lat: latitude, lon: longitude });
  return normalized ? normalized.address : null;
}
