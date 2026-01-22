import React, { useState } from 'react';
import './ImageUploadForm.css';

const ImageUploadForm = ({ onUploadSuccess, maxSize = 5 }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadedUrl(data.data.url);
        if (onUploadSuccess) {
          onUploadSuccess(data.data.url);
        }
        setFile(null);
        setPreview(null);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadedUrl(null);
  };

  return (
    <div className="image-upload-form">
      <div className="upload-container">
        <label className="file-input-label">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
          <span className="upload-icon">📸</span>
          <span className="upload-text">Click to select image</span>
          <span className="upload-hint">or drag and drop</span>
        </label>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <p className="preview-filename">{file?.name}</p>
            <p className="preview-size">
              {(file?.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {uploadedUrl && (
          <div className="success-message">
            <p>✅ Image uploaded successfully!</p>
            <code className="image-url">{uploadedUrl}</code>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        <div className="button-group">
          {preview && !uploadedUrl && (
            <>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-upload"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <button
                onClick={handleClear}
                disabled={uploading}
                className="btn-cancel"
              >
                Cancel
              </button>
            </>
          )}
          {uploadedUrl && (
            <button
              onClick={handleClear}
              className="btn-new"
            >
              Upload Another
            </button>
          )}
        </div>

        <div className="upload-info">
          <p>📋 Supported: JPEG, PNG, GIF, WebP</p>
          <p>📦 Max size: {maxSize}MB</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadForm;
