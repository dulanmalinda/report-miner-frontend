// src/components/ErrorBoundary/ErrorBoundary.jsx
import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>🚨 Something went wrong</h2>
            <p>An unexpected error occurred in the chat interface.</p>
            
            <details className="error-details">
              <summary>Error Details</summary>
              <pre className="error-stack">
                {this.state.error ? this.state.error.toString() : 'Unknown error occurred'}
                {this.state.errorInfo && this.state.errorInfo.componentStack && (
                  <>
                    <br />
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
            
            <div className="error-actions">
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="retry-button"
              >
                🔄 Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                🔄 Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;