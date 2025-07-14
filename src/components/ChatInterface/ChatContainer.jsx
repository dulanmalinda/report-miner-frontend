// src/components/ChatInterface/ChatContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat, ActionTypes } from '../../context/ChatContext.jsx';
import { useReportMinerChat } from '../../hooks/useReportMinerChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConnectionStatus from './ConnectionStatus';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import './ChatContainer.css';

const ChatContainer = () => {
  const { state, dispatch, createNewSession } = useChat();
  const {
    sendMessage,
    uploadFile,
    stopOperation,
    retryConnection,
    isLoading,
    isUploading,
    uploadProgress,
    connectionStatus,
  } = useReportMinerChat();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSendMessage = async (content) => {
    await sendMessage(content);
  };

  const handleFileUpload = async (formData, file, filename) => {
    await uploadFile(formData, file, filename);
  };

  const handleStopOperation = () => {
    stopOperation();
  };

  const handleNewChat = () => {
    createNewSession();
  };

  const handleRetryConnection = async () => {
    await retryConnection();
  };

  return (
    <ErrorBoundary>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <h1 className="chat-title">ReportMiner</h1>
            <ConnectionStatus 
              status={connectionStatus}
              onRetry={handleRetryConnection}
            />
          </div>
          
          <div className="header-right">
            <button
              className="new-chat-btn"
              onClick={handleNewChat}
              disabled={isLoading || isUploading}
              title="Start a new chat"
            >
              ➕ New Chat
            </button>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{state.error.message}</span>
              {state.error.code && (
                <span className="error-code">({state.error.code})</span>
              )}
            </div>
            <button
              className="error-dismiss"
              onClick={() => dispatch({ type: ActionTypes.CLEAR_ERROR })}
            >
              ✕
            </button>
          </div>
        )}

        {/* Connection Status Banner */}
        {connectionStatus === 'disconnected' && (
          <div className="status-banner disconnected">
            <span>🔴 Disconnected from ReportMiner API</span>
            <button onClick={handleRetryConnection}>Retry Connection</button>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="status-banner connecting">
            <span>🟡 Connecting to ReportMiner API...</span>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="status-banner error">
            <span>🔴 Connection Error - Please ensure the ReportMiner API is running on localhost:8000 and the endpoints /api/query/chat/query/ and /api/query/chat/upload/ are available</span>
            <button onClick={handleRetryConnection}>Retry</button>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="chat-main">
          {/* Messages */}
          <div className="messages-container">
            {state.messages.length === 0 && connectionStatus === 'connected' && (
              <div className="welcome-message">
                <div className="welcome-content">
                  <h2>👋 Welcome to ReportMiner</h2>
                  <p>Upload documents and ask questions about your data</p>
                  <div className="welcome-hints">
                    <p className="welcome-hint">
                      <span className="hint-icon">📤</span>
                      <span className="hint-text">Use the upload button to add documents</span>
                    </p>
                    <p className="welcome-hint">
                      <span className="hint-icon">💬</span>
                      <span className="hint-text">Ask questions like "What insights can you provide from the uploaded data?"</span>
                    </p>
                    <p className="welcome-hint">
                      <span className="hint-icon">📊</span>
                      <span className="hint-text">Request analysis with "Give me an average laptop price from the dataset"</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state.messages.length === 0 && connectionStatus !== 'connected' && (
              <div className="welcome-message">
                <div className="welcome-content error-welcome">
                  <h2>⚠️ Connection Required</h2>
                  <p>Please ensure the ReportMiner API is running with the following endpoints:</p>
                  <div className="endpoint-list">
                    <code>http://localhost:8000/api/query/chat/query/</code>
                    <code>http://localhost:8000/api/query/chat/upload/</code>
                  </div>
                  <button onClick={handleRetryConnection} className="retry-welcome-btn">Retry Connection</button>
                </div>
              </div>
            )}

            <MessageList 
              messages={state.messages} 
              isLoading={isLoading}
              currentModel="ReportMiner AI"
            />
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            <MessageInput
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopOperation}
              onFileUpload={handleFileUpload}
              disabled={connectionStatus !== 'connected'}
              isLoading={isLoading}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              placeholder={
                connectionStatus !== 'connected' 
                  ? 'Connect to ReportMiner API to start chatting...'
                  : 'Ask a question or upload a file...'
              }
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ChatContainer;