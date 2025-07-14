// src/components/FileUpload/FileUpload.jsx
import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onUpload, isUploading, uploadProgress, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    
    // Set default filename from file name (remove extension)
    const defaultName = file.name.replace(/\.[^/.]+$/, "");
    setFilename(defaultName);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filename', filename);
      formData.append('type', selectedFile.type);

      await onUpload(formData, selectedFile, filename);
      
      // Reset state after successful upload
      setSelectedFile(null);
      setFilename('');
      setError(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError(error.message || 'Upload failed');
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Cancel upload
  const handleCancel = () => {
    setSelectedFile(null);
    setFilename('');
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
      <input 
        type="file" 
        onChange={handleFileChange} 
        ref={fileInputRef}
        style={{ display: 'none' }}
        disabled={isUploading || disabled}
      />
      
      {!selectedFile ? (
        <button 
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading || disabled}
          className="file-select-button"
          title="Select a file to upload"
        >
          {isUploading ? '⏳ Uploading...' : '📎 Select File'}
        </button>
      ) : (
        <div className="file-details">
          <div className="file-info">
            <span className="file-icon">📄</span>
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          
          <div className="filename-input">
            <label htmlFor="filename">Document Name:</label>
            <input
              type="text"
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter document name"
              disabled={isUploading}
            />
          </div>
          
          <div className="file-actions">
            <button 
              type="button" 
              onClick={handleUpload}
              disabled={isUploading || !filename}
              className="upload-button"
            >
              {isUploading ? '⏳ Uploading...' : '📤 Upload'}
            </button>
            
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={isUploading}
              className="cancel-button"
            >
              ✖️ Cancel
            </button>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">{uploadProgress}%</div>
        </div>
      )}
      
      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
