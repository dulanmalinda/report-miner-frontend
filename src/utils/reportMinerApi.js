// src/utils/reportMinerApi.js

/**
 * ReportMiner API Service
 * Handles interaction with the ReportMiner backend API
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Error class for API errors
export class ReportMinerApiError extends Error {
  constructor(message, status, code, data = null) {
    super(message);
    this.name = 'ReportMinerApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

class ReportMinerAPI {
  constructor(baseUrl = API_BASE_URL) {
    // Ensure the baseUrl doesn't have a trailing slash
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    console.log(`Initializing ReportMiner API with base URL: ${this.baseUrl}`);
  }

  /**
   * Check if the API is accessible
   * @returns {Promise<Object>} Connection status
   */
  async checkConnection() {
    try {
      console.log(`Checking connection to API at ${this.baseUrl}/query/ask/`);
      // Instead of pinging a /ping endpoint that doesn't exist,
      // we'll do a simple OPTIONS request to one of the known endpoints
      const response = await fetch(`${this.baseUrl}/query/ask/`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Connection check response:`, response);
      
      // If we get any response, consider the API connected
      return { 
        connected: true, 
        status: response.status
      };
    } catch (error) {
      console.error('API connection check failed:', error);
      
      if (error instanceof ReportMinerApiError) throw error;
      
      throw new ReportMinerApiError(
        'Failed to connect to ReportMiner API. Please ensure the server is running.',
        0,
        'CONNECTION_ERROR'
      );
    }
  }

  /**
   * Send a query to the ask endpoint
   * @param {string} question The question to ask
   * @param {Object} options Query options (for backwards compatibility)
   * @returns {Promise<Object>} Query response
   */
  async sendQuery(question, options = {}) {
    try {
      console.log(`📤 Sending query to API:`, {
        question
      });

      const payload = {
        question
      };

      // Use the full path for the query endpoint
      const response = await fetch(`${this.baseUrl}/query/ask/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log(`📥 Received API response:`, {
        answerPreview: data.answer?.substring(0, 100) + '...',
        sourcesCount: data.sources?.length || 0,
      });

      if (!response.ok) {
        throw new ReportMinerApiError(
          data.detail || data.message || `Query failed: ${response.status}`,
          response.status,
          'QUERY_ERROR',
          data
        );
      }

      // Check if response has required fields
      if (!data.answer) {
        throw new ReportMinerApiError(
          'Invalid response format: missing answer field',
          response.status,
          'QUERY_ERROR',
          data
        );
      }

      return data;
    } catch (error) {
      console.error('API query failed:', error);
      
      if (error instanceof ReportMinerApiError) throw error;
      
      throw new ReportMinerApiError(
        error.message || 'Failed to send query to ReportMiner API',
        0,
        'QUERY_ERROR'
      );
    }
  }

  /**
   * Upload a file to the chat
   * @param {FormData} formData Form data containing the file and metadata
   * @param {Function} onProgress Progress callback
   * @returns {Promise<Object>} Upload response
   */
  async uploadFile(formData, onProgress = null) {
    try {
      console.log(`📤 Uploading file to API`);
      
      // Create XMLHttpRequest to track upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Use the full path for the upload endpoint
        xhr.open('POST', `${this.baseUrl}/ingestion/upload/`, true);
        
        // DO NOT set Content-Type header for multipart/form-data
        // Let the browser set it automatically with the boundary parameter
        // Track upload progress if callback provided
        if (onProgress && typeof onProgress === 'function') {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              onProgress(percentComplete, event);
            }
          };
        }
        
        xhr.onload = function() {
          if (this.status >= 200 && this.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              
              console.log(`📥 File upload response:`, {
                id: response.id,
                status: response.status,
              });
              
              // Check if response has required fields (new format)
              if (!response.id || !response.status) {
                reject(new ReportMinerApiError(
                  'Invalid upload response format',
                  this.status,
                  'UPLOAD_ERROR',
                  response
                ));
                return;
              }
              
              resolve(response);
            } catch (err) {
              reject(new ReportMinerApiError(
                'Invalid response format',
                this.status,
                'UPLOAD_ERROR'
              ));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new ReportMinerApiError(
                errorData.detail || errorData.message || `Upload failed: ${this.status}`,
                this.status,
                'UPLOAD_ERROR',
                errorData
              ));
            } catch (err) {
              reject(new ReportMinerApiError(
                `Upload failed: ${this.status}`,
                this.status,
                'UPLOAD_ERROR'
              ));
            }
          }
        };
        
        xhr.onerror = function() {
          reject(new ReportMinerApiError(
            'Network error during file upload',
            0,
            'UPLOAD_ERROR'
          ));
        };
        
        // Send the form data
        xhr.send(formData);
      });
    } catch (error) {
      console.error('API file upload failed:', error);
      
      if (error instanceof ReportMinerApiError) throw error;
      
      throw new ReportMinerApiError(
        error.message || 'Failed to upload file to ReportMiner API',
        0,
        'UPLOAD_ERROR'
      );
    }
  }

  /**
   * Get session history
   * @param {string} sessionId Session ID
   * @returns {Promise<Object>} Session history
   */
  async getSessionHistory(sessionId) {
    try {
      console.log(`📤 Fetching session history for: ${sessionId}`);

      const response = await fetch(`${this.baseUrl}/history/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      console.log(`📥 Received session history:`, {
        success: data.success,
        messageCount: data.messages?.length || 0,
      });

      if (!response.ok || !data.success) {
        throw new ReportMinerApiError(
          data.message || `Failed to fetch session history: ${response.status}`,
          response.status,
          'HISTORY_ERROR',
          data
        );
      }

      return data;
    } catch (error) {
      console.error('API session history fetch failed:', error);
      
      if (error instanceof ReportMinerApiError) throw error;
      
      throw new ReportMinerApiError(
        error.message || 'Failed to fetch session history',
        0,
        'HISTORY_ERROR'
      );
    }
  }
}

// Create and export a singleton instance
export const reportMinerApi = new ReportMinerAPI();

export default reportMinerApi;
