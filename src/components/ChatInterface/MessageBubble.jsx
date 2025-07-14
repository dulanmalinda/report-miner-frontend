// src/components/ChatInterface/MessageBubble.jsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MessageBubble.css';

const MessageBubble = ({ message, currentModel }) => {
  const [showThinking, setShowThinking] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isError = message.isError;
  const isStreaming = message.isStreaming;
  const isTool = message.role === 'tool';
  const isToolResponse = message.isToolResponse;
  const isFileUpload = message.isFileUpload;
  const fileData = message.fileData;
  const isSystem = message.role === 'system';

  // Check if the message has sources
  const hasSources = message.sources && message.sources.length > 0;
  
  // Check if message has tool usage data
  const hasToolsUsed = message.toolsUsed && message.toolsUsed.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return '';
    const ms = milliseconds;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format processing time
  const formatProcessingTime = (time) => {
    if (!time) return '';
    return `${time.toFixed(2)}s`;
  };

  // Format the file upload results
  const formatFileResults = (results) => {
    if (!results) return null;
    
    return (
      <div className="file-results">
        {results.text_segments > 0 && (
          <div className="result-item">
            <span className="result-label">Text segments:</span>
            <span className="result-value">{results.text_segments}</span>
          </div>
        )}
        {results.embeddings > 0 && (
          <div className="result-item">
            <span className="result-label">Embeddings:</span>
            <span className="result-value">{results.embeddings}</span>
          </div>
        )}
        {results.tables > 0 && (
          <div className="result-item">
            <span className="result-label">Tables:</span>
            <span className="result-value">{results.tables}</span>
          </div>
        )}
        {results.key_values > 0 && (
          <div className="result-item">
            <span className="result-label">Key values:</span>
            <span className="result-value">{results.key_values}</span>
          </div>
        )}
      </div>
    );
  };

  // Custom components for ReactMarkdown
  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && language ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="markdown-code-block"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="markdown-inline-code" {...props}>
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <div className="markdown-pre">{children}</div>;
    },
    h1({ children }) {
      return <h1 className="markdown-h1">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="markdown-h2">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="markdown-h3">{children}</h3>;
    },
    h4({ children }) {
      return <h4 className="markdown-h4">{children}</h4>;
    },
    h5({ children }) {
      return <h5 className="markdown-h5">{children}</h5>;
    },
    h6({ children }) {
      return <h6 className="markdown-h6">{children}</h6>;
    },
    ul({ children }) {
      return <ul className="markdown-ul">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="markdown-ol">{children}</ol>;
    },
    li({ children }) {
      return <li className="markdown-li">{children}</li>;
    },
    blockquote({ children }) {
      return <blockquote className="markdown-blockquote">{children}</blockquote>;
    },
    p({ children }) {
      return <p className="markdown-p">{children}</p>;
    },
    strong({ children }) {
      return <strong className="markdown-strong">{children}</strong>;
    },
    em({ children }) {
      return <em className="markdown-em">{children}</em>;
    },
    hr() {
      return <hr className="markdown-hr" />;
    },
    table({ children }) {
      return <table className="markdown-table">{children}</table>;
    },
    thead({ children }) {
      return <thead className="markdown-thead">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody className="markdown-tbody">{children}</tbody>;
    },
    tr({ children }) {
      return <tr className="markdown-tr">{children}</tr>;
    },
    th({ children }) {
      return <th className="markdown-th">{children}</th>;
    },
    td({ children }) {
      return <td className="markdown-td">{children}</td>;
    },
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''} ${isStreaming ? 'streaming' : ''} ${isTool ? 'tool' : ''} ${isToolResponse ? 'tool-response' : ''} ${isFileUpload ? 'file-upload' : ''} ${isSystem ? 'system' : ''}`}>
      <div className="message-header">
        <div className="message-role">
          <span className="role-icon">
            {isUser ? '👤' : isTool ? '🔧' : isError ? '❌' : isFileUpload ? '📄' : isSystem ? '🔔' : '🤖'}
          </span>
          <span className="role-name">
            {isUser ? 'You' : isTool ? `Tool: ${message.toolName || 'Function'}` : isError ? 'Error' : isToolResponse ? `${currentModel} (response)` : isFileUpload ? 'File Upload' : isSystem ? 'System' : currentModel}
          </span>
        </div>
        
        <div className="message-actions">
          {message.timestamp && (
            <span className="message-time">
              {formatTimestamp(message.timestamp)}
            </span>
          )}
          
          {/* Confidence display */}
          {message.confidence && (
            <span className="message-confidence" title="AI Confidence">
              {(message.confidence * 100).toFixed(0)}% Conf.
            </span>
          )}
          
          {/* Thinking toggle for Qwen3 */}
          {message.thinking && (
            <button
              className="thinking-toggle"
              onClick={() => setShowThinking(!showThinking)}
              title="Show/hide thinking process"
            >
              🧠 {showThinking ? 'Hide' : 'Show'} Thinking
            </button>
          )}
          
          {/* Sources toggle */}
          {hasSources && (
            <button
              className="sources-toggle"
              onClick={() => setShowSources(!showSources)}
              title="Show/hide sources"
            >
              📚 {showSources ? 'Hide' : 'Show'} Sources
            </button>
          )}
          
          {/* Metadata toggle */}
          {(message.metadata || message.processing_time) && (
            <button
              className="metadata-toggle"
              onClick={() => setShowMetadata(!showMetadata)}
              title="Show/hide metadata"
            >
              📊 {showMetadata ? 'Hide' : 'Show'} Stats
            </button>
          )}
          
          {/* Copy button */}
          {!isFileUpload && !isSystem && (
            <button
              className="copy-button"
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? '✅' : '📋'}
            </button>
          )}
        </div>
      </div>

      {/* Thinking content */}
      {showThinking && message.thinking && (
        <div className="thinking-content">
          <div className="thinking-header">
            <span>🧠 Thinking Process:</span>
          </div>
          <div className="thinking-text">
            <ReactMarkdown components={markdownComponents}>
              {message.thinking}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Tool calls display */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="tool-calls">
          <div className="tool-calls-header">
            <span>🛠️ Tool Calls:</span>
          </div>
          {message.toolCalls.map((toolCall, index) => (
            <div key={index} className="tool-call">
              <div className="tool-name">
                {toolCall.function?.name || toolCall.name}
              </div>
              <div className="tool-params">
                <pre className="tool-params-code">
                  {JSON.stringify(toolCall.function?.arguments || toolCall.parameters, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File upload display */}
      {isFileUpload && fileData && (
        <div className="file-data">
          <div className="file-header">
            <span className="file-icon">📄</span>
            <span className="file-name">{fileData.filename}</span>
            <span className="file-type">{fileData.file_type}</span>
          </div>
          
          <div className="file-details">
            <div className="file-status">
              <span className="status-label">Status:</span>
              <span className={`status-value ${fileData.status}`}>
                {fileData.status === 'completed' ? '✅ Completed' : fileData.status === 'processing' ? '⏳ Processing' : fileData.status}
              </span>
            </div>
            
            <div className="file-id">
              <span className="id-label">Document ID:</span>
              <span className="id-value">{fileData.document_id}</span>
            </div>
            
            {fileData.ready_for_queries && (
              <div className="file-ready">
                <span className="ready-icon">✅</span>
                <span className="ready-text">Ready for queries</span>
              </div>
            )}
            
            {fileData.processing_results && formatFileResults(fileData.processing_results)}
          </div>
        </div>
      )}

      {/* Main message content */}
      {!isFileUpload && (
        <div className="message-content">
          {isStreaming ? (
            <div className="streaming-content">
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
              <span className="streaming-cursor">▊</span>
            </div>
          ) : (
            <ReactMarkdown components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      )}

      {/* Tools used display */}
      {hasToolsUsed && (
        <div className="tools-used">
          <span className="tools-used-label">🔧 Tools used:</span>
          <div className="tools-used-list">
            {message.toolsUsed.map((tool, index) => (
              <span key={index} className="tool-badge">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sources display */}
      {showSources && hasSources && (
        <div className="sources-container">
          <div className="sources-header">
            <span>📚 Sources:</span>
          </div>
          <div className="sources-list">
            {message.sources.map((source, index) => (
              <div key={index} className="source-item">
                <div className="source-title">
                  <span className="source-icon">📄</span>
                  <span className="source-name">{source.title || source.filename || `Source ${index + 1}`}</span>
                </div>
                {source.content && (
                  <div className="source-content">
                    <ReactMarkdown components={markdownComponents}>
                      {source.content}
                    </ReactMarkdown>
                  </div>
                )}
                {source.url && (
                  <div className="source-url">
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata display */}
      {showMetadata && (message.metadata || message.processing_time) && (
        <div className="message-metadata">
          <div className="metadata-grid">
            {message.processing_time && (
              <div className="metadata-item">
                <span className="metadata-label">Processing Time:</span>
                <span className="metadata-value">
                  {formatProcessingTime(message.processing_time)}
                </span>
              </div>
            )}
            
            {message.metadata?.model_used && (
              <div className="metadata-item">
                <span className="metadata-label">Model:</span>
                <span className="metadata-value">{message.metadata.model_used}</span>
              </div>
            )}
            
            {message.metadata?.tools_executed !== undefined && (
              <div className="metadata-item">
                <span className="metadata-label">Tools Executed:</span>
                <span className="metadata-value">{message.metadata.tools_executed}</span>
              </div>
            )}
            
            {message.metadata?.sources_found !== undefined && (
              <div className="metadata-item">
                <span className="metadata-label">Sources Found:</span>
                <span className="metadata-value">{message.metadata.sources_found}</span>
              </div>
            )}
            
            {message.metadata?.response_type && (
              <div className="metadata-item">
                <span className="metadata-label">Response Type:</span>
                <span className="metadata-value">{message.metadata.response_type}</span>
              </div>
            )}
            
            {/* Original Ollama metrics */}
            {message.metadata?.eval_count && message.metadata?.eval_duration && (
              <div className="metadata-item">
                <span className="metadata-label">Speed:</span>
                <span className="metadata-value">
                  {(message.metadata.eval_count / (message.metadata.eval_duration / 1000000000)).toFixed(1)} tokens/s
                </span>
              </div>
            )}
            
            {message.metadata?.eval_count && (
              <div className="metadata-item">
                <span className="metadata-label">Tokens:</span>
                <span className="metadata-value">{message.metadata.eval_count}</span>
              </div>
            )}
            
            {message.metadata?.total_duration && (
              <div className="metadata-item">
                <span className="metadata-label">Total Time:</span>
                <span className="metadata-value">
                  {formatDuration(message.metadata.total_duration)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;