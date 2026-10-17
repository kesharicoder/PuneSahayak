import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, ZoomIn, AlertCircle } from 'lucide-react';

export function ImageUploader({ image, onImageChange }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 8MB');
      return;
    }
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageChange({
        dataUrl: event.target.result,
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-uploader-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
        id="civic-image-input"
        aria-label="Upload photo of the civic issue"
      />

      {!image ? (
        <div
          className="image-dropzone"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current && fileInputRef.current.click();
            }
          }}
          aria-label="Attach photo of civic issue"
        >
          <div className="dropzone-icon-pill">
            <Camera size={18} />
          </div>
          <div className="dropzone-text">
            <strong>Attach a photo <span className="optional">(optional)</span></strong>
            <small>Helps PMC identify the exact spot · JPG, PNG up to 8MB</small>
          </div>
        </div>
      ) : (
        <div className="image-preview-card">
          <div
            className="image-thumbnail-wrap"
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="View photo preview full size"
          >
            <img
              src={image.dataUrl}
              alt="Uploaded issue evidence"
              className="image-thumbnail"
              loading="lazy"
            />
            <div className="thumbnail-overlay">
              <ZoomIn size={16} />
              <span>Tap to enlarge</span>
            </div>
          </div>

          <div className="image-details">
            <div className="image-filename" title={image.name}>{image.name}</div>
            <div className="image-meta-info">
              <span>{image.size}</span>
              <span className="dot-divider">·</span>
              <span className="badge-ready">Ready for report</span>
            </div>
          </div>

          <button
            type="button"
            className="remove-image-btn"
            onClick={handleRemove}
            aria-label="Remove photo"
            title="Remove photo"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="upload-error">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Responsive Lightbox Modal */}
      {lightboxOpen && image && (
        <div
          className="modal-backdrop lightbox-backdrop"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-title">{image.name}</span>
              <button
                type="button"
                className="icon-button close-lightbox"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close photo preview"
              >
                <X size={20} />
              </button>
            </div>
            <div className="lightbox-image-container">
              <img
                src={image.dataUrl}
                alt="Enlarged issue evidence"
                className="lightbox-full-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
