// src/hooks/useReportMinerChat.js
import { useCallback, useRef, useEffect } from 'react';
import { useChat, ActionTypes } from '../context/ChatContext.jsx';
import { reportMinerApi, ReportMinerApiError } from '../utils/reportMinerApi';

/**
 * Custom hook for ReportMiner API integration
 */
export const useReportMinerChat = () => {
  const {
    state,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    clearError,
    setConnectionStatus,
    setUploading,
    setUploadProgress,
    addUploadedFile,
  } = useChat();

  const connectionCheckedRef = useRef(false);

  // Check API connection on mount
  useEffect(() => {
    if (connectionCheckedRef.current) return;
    
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Try to connect to the API
        const connection = await reportMinerApi.checkConnection();
        
        if (connection.connected) {
          setConnectionStatus('connected');
          console.log('✅ Connected to ReportMiner API');
        } else {
          setConnectionStatus('error');
          console.error('⚠️ Failed to connect to ReportMiner API');
        }
      } catch (error) {
        console.error('❌ Connection check failed:', error);
        setConnectionStatus('error');
      } finally {
        connectionCheckedRef.current = true;
      }
    };

    checkConnection();
  }, [setConnectionStatus]);

  // Manual connection retry
  const retryConnection = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      const connection = await reportMinerApi.checkConnection();
      
      if (connection.connected) {
        setConnectionStatus('connected');
        console.log('✅ Reconnected to ReportMiner API');
      } else {
        setConnectionStatus('error');
        console.error('⚠️ Failed to reconnect to ReportMiner API');
      }
    } catch (error) {
      console.error('❌ Connection retry failed:', error);
      setConnectionStatus('error');
    }
  }, [setConnectionStatus]);

  // Enhanced send message with ReportMiner API
  const sendMessage = useCallback(async (content, options = {}) => {
    if (!content.trim()) return;

    try {
      clearError();
      setLoading(true);

      // Add user message to the chat
      const userMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      
      addMessage(userMessage);
      console.log('📝 Added user message to chat');

      // Prepare API call
      const queryOptions = {
        sessionId: state.sessionId,
        includeTools: state.settings.enableTools,
        includeSources: state.settings.includeSources,
      };
      
      console.log('🚀 Sending query to API with options:', queryOptions);

      // Call the API
      const response = await reportMinerApi.sendQuery(content, queryOptions);
      
      if (response.success) {
        console.log('✅ Received successful response from API');
        
        // Add assistant message
        const assistantMessage = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response.message,
          sources: response.sources || [],
          toolsUsed: response.tools_used || [],
          confidence: response.confidence,
          processing_time: response.processing_time,
          session_id: response.session_id,
          timestamp: new Date().toISOString(),
          metadata: response.metadata,
        };
        
        // Add message to the chat
        addMessage(assistantMessage);
        
        console.log('📝 Added assistant response to chat');
      } else {
        // This should not happen as the API will throw an error for unsuccessful responses
        console.error('⚠️ Received unsuccessful response from API');
        
        setError({
          message: response.message || 'Failed to get response from API',
          code: 'API_ERROR',
        });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      setError({
        message: error.message || 'An unexpected error occurred',
        code: error.code || 'UNKNOWN_ERROR',
      });
      
      // Add error message to the chat
      addMessage({
        role: 'assistant',
        content: `Error: ${error.message || 'An unexpected error occurred'}`,
        isError: true,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [
    state.sessionId,
    state.settings.enableTools,
    state.settings.includeSources,
    addMessage,
    setLoading,
    setError,
    clearError,
  ]);

  // File upload function
  const uploadFile = useCallback(async (formData, file, filename) => {
    try {
      clearError();
      setUploading(true);
      setUploadProgress(0);
      
      console.log('📤 Uploading file:', filename);
      
      // Add uploading message
      const uploadingMessageId = `${Date.now()}-upload`;
      addMessage({
        id: uploadingMessageId,
        role: 'system',
        content: `Uploading file: ${filename}...`,
        isUploading: true,
        timestamp: new Date().toISOString(),
      });
      
      // Upload file with progress tracking
      const response = await reportMinerApi.uploadFile(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      if (response.success) {
        console.log('✅ File uploaded successfully:', response.data);
        
        // Update the uploading message with success
        updateMessage({
          id: uploadingMessageId,
          role: 'system',
          content: `File uploaded successfully: ${filename}`,
          isUploading: false,
          timestamp: new Date().toISOString(),
        });
        
        // Add file upload message
        addMessage({
          role: 'system',
          content: `File uploaded: ${response.data.filename}`,
          fileData: response.data,
          isFileUpload: true,
          timestamp: new Date().toISOString(),
        });
        
        // Add to uploaded files in state
        addUploadedFile(response.data);
        
        return response.data;
      } else {
        throw new Error(response.message || 'File upload failed');
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      
      setError({
        message: error.message || 'An unexpected error occurred during file upload',
        code: error.code || 'UPLOAD_ERROR',
      });
      
      // Add error message
      addMessage({
        role: 'system',
        content: `Error uploading file: ${error.message || 'Unknown error'}`,
        isError: true,
        timestamp: new Date().toISOString(),
      });
      
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [
    addMessage,
    updateMessage,
    setUploading,
    setUploadProgress,
    setError,
    clearError,
    addUploadedFile,
  ]);

  // Function to stop any ongoing operations
  const stopOperation = useCallback(() => {
    // No streaming to stop in this implementation
    setLoading(false);
  }, [setLoading]);

  return {
    sendMessage,
    uploadFile,
    stopOperation,
    retryConnection,
    isLoading: state.isLoading,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    error: state.error,
    connectionStatus: state.connectionStatus,
    uploadedFiles: state.uploadedFiles,
    sessionId: state.sessionId,
  };
};

export default useReportMinerChat;