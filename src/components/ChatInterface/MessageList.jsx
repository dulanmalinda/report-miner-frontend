// src/components/ChatInterface/MessageList.jsx
import React from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

const MessageList = ({ messages, streamingMessage, isStreaming, isLoading, currentModel }) => {
  return (
    <div className="message-list">
      {messages.filter(message => !(message.isStreaming && message.content === '')).map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          currentModel={currentModel}
        />
      ))}
      
      {/* Streaming message display */}
      {isStreaming && streamingMessage && (
        <MessageBubble
          key="streaming-message"
          message={{
            role: 'assistant',
            content: streamingMessage,
            isStreaming: true,
          }}
          currentModel={currentModel}
        />
      )}
      
      {/* Loading/Typing indicator when waiting for response */}
      {isLoading && (
        <TypingIndicator key="loading-indicator" model={currentModel} />
      )}
    </div>
  );
};

export default MessageList;