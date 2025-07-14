// src/components/ChatInterface/MessageInput.jsx
import React, { useState, useRef } from 'react';
import FileUpload from '../FileUpload/FileUpload';
import './MessageInput.css';

const MessageInput = ({ 
  onSendMessage, 
  onStopGeneration, 
  onFileUpload,
  disabled, 
  isLoading, 
  isStreaming, 
  isUploading,
  uploadProgress,
  placeholder,
}) => {
  const [message, setMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileInputRef = useRef(null);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStreaming) {
      // Stop generation if streaming
      onStopGeneration();
    } else if (message.trim() && !disabled && !isLoading && !isUploading) {
      // Send message if not streaming and not uploading
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle input changes
  const handleInput = (e) => {
    setMessage(e.target.value);
  };

  // Toggle file upload panel
  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  // Handle file selection button click
  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show file upload panel
    setShowFileUpload(true);
  };

  // Handle file upload
  const handleFileUpload = async (formData, file, filename) => {
    if (onFileUpload) {
      await onFileUpload(formData, file, filename);
      // Hide the file upload panel after successful upload
      setShowFileUpload(false);
    }
  };

  return (
    <div className="message-input-wrapper">
      {/* File Upload Panel */}
      {showFileUpload && (
        <FileUpload
          onUpload={handleFileUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          disabled={disabled || isLoading || isStreaming}
        />
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="message-input-container">
        {/* File Upload Button */}
        <button
          type="button"
          onClick={toggleFileUpload}
          disabled={isStreaming || disabled}
          className={`file-button ${showFileUpload ? 'active' : ''}`}
          title={showFileUpload ? 'Hide file upload' : 'Upload file'}
        >
          {showFileUpload ? '📁' : '📎'}
        </button>

        {/* Message Input */}
        <textarea
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isUploading}
          className="message-input"
          rows={3}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={
            isStreaming 
              ? false 
              : (!message.trim() || disabled || isLoading || isUploading)
          }
          className={`send-button ${isStreaming ? 'stop-button' : ''}`}
        >
          {isStreaming ? (
            <>
              ⏹️ Stop
            </>
          ) : isLoading ? (
            <>
              <div className="loading-spinner" />
              Sending...
            </>
          ) : isUploading ? (
            <>
              ⏳ Uploading...
            </>
          ) : (
            <>
              📤 Send
            </>
          )}
        </button>

        {/* Hidden file input (used for direct file button in mobile) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={isStreaming || disabled || isUploading}
        />
      </form>
    </div>
  );
};

export default MessageInput;