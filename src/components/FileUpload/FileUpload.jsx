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
    
    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'csv', 'xlsx', 'xls', 'docx', 'doc', 'json', 'html', 'jpg', 'jpeg', 'png', 'txt'];
    
    if (!validExtensions.includes(extension)) {
      setError(`Unsupported file type: ${extension}. Please use PDF, CSV, Excel, Word, etc.`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
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
      
      // Map MIME type to simplified type that the server expects
      let simpleType = 'text';
      const mimeType = selectedFile.type.toLowerCase();
      
      if (mimeType.includes('pdf')) {
        simpleType = 'pdf';
      } else if (mimeType.includes('csv') || mimeType.includes('comma-separated-values')) {
        simpleType = 'csv';
      } else if (mimeType.includes('excel') || mimeType.includes('spreadsheetml')) {
        simpleType = 'xlsx';
      } else if (mimeType.includes('word') || mimeType.includes('document')) {
        simpleType = 'docx';
      } else if (mimeType.includes('text')) {
        simpleType = 'text';
      } else if (mimeType.includes('json')) {
        simpleType = 'json';
      } else if (mimeType.includes('html')) {
        simpleType = 'html';
      } else if (mimeType.includes('image')) {
        simpleType = 'image';
      }
      
      // Use file extension as fallback if MIME type mapping fails
      if (simpleType === 'text') {
        const extension = selectedFile.name.split('.').pop().toLowerCase();
        if (['pdf', 'csv', 'xlsx', 'xls', 'docx', 'doc', 'json', 'html', 'jpg', 'jpeg', 'png'].includes(extension)) {
          if (extension === 'xls') simpleType = 'xlsx';
          else if (extension === 'doc') simpleType = 'docx';
          else if (['jpg', 'jpeg', 'png'].includes(extension)) simpleType = 'image';
          else simpleType = extension;
        }
      }
      
      console.log(`Mapped MIME type ${selectedFile.type} to simplified type: ${simpleType}`);
      formData.append('type', simpleType);

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
        accept=".pdf,.csv,.xlsx,.xls,.docx,.doc,.json,.html,.jpg,.jpeg,.png,.txt"
      />
      
      {!selectedFile ? (
        <button 
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading || disabled}
          className="file-select-button"
          title="Select a file to upload (PDF, CSV, Excel, Word, etc.)"
        >
          {isUploading ? '⏳ Uploading...' : '📎 Select File (PDF, CSV, etc.)'}
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
