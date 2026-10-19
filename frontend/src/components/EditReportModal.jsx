import { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Edit3, AlertCircle } from 'lucide-react';

export function EditReportModal({
  isOpen,
  onClose,
  result,
  onSave
}) {
  const [formData, setFormData] = useState({
    summary: '',
    summaryMr: '',
    category: '',
    urgency: 'Medium',
    location: '',
    department: '',
    actions: []
  });

  const [newAction, setNewAction] = useState('');

  useEffect(() => {
    if (result) {
      setFormData({
        summary: result.summary || '',
        summaryMr: result.summaryMr || '',
        category: result.category || 'Roads & footpaths',
        urgency: result.urgency || 'Medium',
        location: result.location || 'Kothrud, Pune',
        department: result.department || 'Road Department',
        actions: [...(result.actions || [])]
      });
    }
  }, [result]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleActionChange = (index, value) => {
    const updated = [...formData.actions];
    updated[index] = value;
    setFormData({ ...formData, actions: updated });
  };

  const handleRemoveAction = (index) => {
    const updated = formData.actions.filter((_, i) => i !== index);
    setFormData({ ...formData, actions: updated });
  };

  const handleAddAction = (e) => {
    e.preventDefault();
    if (newAction.trim()) {
      setFormData({
        ...formData,
        actions: [...formData.actions, newAction.trim()]
      });
      setNewAction('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-report-title"
    >
      <div className="modal-dialog edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge"><Edit3 size={18} /></span>
            <div>
              <h3 id="edit-report-title">Edit Civic Report Details</h3>
              <p className="modal-sub">Make adjustments before generating the official citizen report</p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button modal-close-btn"
            onClick={onClose}
            aria-label="Close edit dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-scroll-body">
          <div className="form-group">
            <label htmlFor="edit-summary-en">Issue Summary (English)</label>
            <textarea
              id="edit-summary-en"
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="modal-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-summary-mr">तक्रार सारांश (मराठी)</label>
            <textarea
              id="edit-summary-mr"
              rows={3}
              value={formData.summaryMr}
              onChange={(e) => setFormData({ ...formData, summaryMr: e.target.value })}
              className="modal-textarea marathi-font"
            />
          </div>

          <div className="form-row-responsive">
            <div className="form-group">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="modal-input"
              >
                <option>Roads & footpaths</option>
                <option>Waste management</option>
                <option>Water supply & drainage</option>
                <option>Street lights</option>
                <option>Traffic & parking</option>
                <option>Garden & trees</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-urgency">Urgency Level</label>
              <select
                id="edit-urgency"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="modal-input"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div className="form-row-responsive">
            <div className="form-group">
              <label htmlFor="edit-location">Location / Ward</label>
              <input
                id="edit-location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="modal-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-dept">PMC Department</label>
              <input
                id="edit-dept"
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="modal-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Recommended PMC Action Steps</label>
            <div className="actions-editor-list">
              {formData.actions.map((act, index) => (
                <div className="action-edit-item" key={index}>
                  <span className="action-number-chip">{index + 1}</span>
                  <input
                    type="text"
                    value={act}
                    onChange={(e) => handleActionChange(index, e.target.value)}
                    className="modal-input action-input"
                    aria-label={`Step ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-action-btn"
                    onClick={() => handleRemoveAction(index)}
                    aria-label={`Delete step ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-action-box">
              <input
                type="text"
                placeholder="Add another recommended action..."
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                className="modal-input add-action-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAction(e);
                  }
                }}
              />
              <button
                type="button"
                className="outline-button small-button add-action-btn"
                onClick={handleAddAction}
                disabled={!newAction.trim()}
              >
                <Plus size={15} /> Add step
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="outline-button modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button modal-btn-save"
            >
              <Check size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
