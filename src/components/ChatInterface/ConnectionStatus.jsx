// src/components/ChatInterface/ConnectionStatus.jsx
import React from 'react';
import './ConnectionStatus.css';

const ConnectionStatus = ({ status, onRetry }) => {
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'disconnected':
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className={`connection-status ${status}`}>
      <div className={`connection-indicator ${status}`} />
      <span>{getStatusIcon()} {getStatusText()}</span>
      {(status === 'error' || status === 'disconnected') && onRetry && (
        <button
          onClick={onRetry}
          className="retry-connection-btn"
          title="Retry connection"
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;