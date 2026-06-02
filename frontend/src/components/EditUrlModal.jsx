import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { urlService } from '../services/urlService';
import { isValidUrl, isValidAlias } from '../utils/validators';
import toast from 'react-hot-toast';

/**
 * Modal for editing an existing short URL
 */
export default function EditUrlModal({ isOpen, onClose, urlData, onSuccess }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt,   setExpiresAt]   = useState('');
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);

  // Populate fields when urlData changes
  useEffect(() => {
    if (urlData) {
      setOriginalUrl(urlData.originalUrl || '');
      setCustomAlias(urlData.customAlias || urlData.shortCode || '');
      setExpiresAt(urlData.expiresAt ? urlData.expiresAt.split('T')[0] : '');
      setErrors({});
    }
  }, [urlData]);

  const validate = () => {
    const newErrors = {};
    if (!originalUrl) {
      newErrors.originalUrl = 'Original URL is required';
    } else if (!isValidUrl(originalUrl)) {
      newErrors.originalUrl = 'Enter a valid URL (including http:// or https://)';
    }
    if (customAlias && !isValidAlias(customAlias)) {
      newErrors.customAlias = 'Alias must be 3-30 alphanumeric characters or hyphens';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { originalUrl };
      if (customAlias) payload.customAlias = customAlias;
      if (expiresAt)   payload.expiresAt   = new Date(expiresAt).toISOString();

      await urlService.updateUrl(urlData._id, payload);
      toast.success('Link updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Short Link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Original URL"
          type="url"
          placeholder="https://example.com/very-long-url"
          value={originalUrl}
          onChange={(e) => { setOriginalUrl(e.target.value); setErrors(p => ({ ...p, originalUrl: '' })); }}
          error={errors.originalUrl}
        />
        <Input
          label="Custom Alias (optional)"
          type="text"
          placeholder="my-custom-alias"
          value={customAlias}
          onChange={(e) => { setCustomAlias(e.target.value); setErrors(p => ({ ...p, customAlias: '' })); }}
          error={errors.customAlias}
          helperText="Leave empty to keep current alias"
        />
        <Input
          label="Expiry Date (optional)"
          type="date"
          value={expiresAt}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setExpiresAt(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" type="submit" loading={loading} className="flex-1">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}