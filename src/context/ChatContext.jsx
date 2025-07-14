// src/context/ChatContext.jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Simple counter for unique IDs
let messageIdCounter = 0;

// Generate unique message ID
const generateMessageId = () => {
  messageIdCounter += 1;
  return `${Date.now()}-${messageIdCounter}`;
};

// Get stored session ID or create a new one
const getInitialSessionId = () => {
  if (typeof window === 'undefined') return `session-${Date.now()}`;
  
  const storedSessionId = localStorage.getItem('reportminer-session-id');
  if (storedSessionId) return storedSessionId;
  
  const newSessionId = `session-${Date.now()}`;
  localStorage.setItem('reportminer-session-id', newSessionId);
  return newSessionId;
};

// Initial state
const initialState = {
  messages: [],
  currentModel: 'gpt-4o', // Default to backend model
  availableModels: ['gpt-4o', 'gpt-3.5-turbo'],
  isLoading: false,
  isStreaming: false,
  error: null,
  connectionStatus: 'disconnected', // disconnected, connecting, connected, error
  tools: [], // Available tools
  toolResults: {}, // Store tool execution results
  streamingMessage: '', // Current streaming message content
  sessionId: getInitialSessionId(),
  modelInfo: null,
  settings: {
    temperature: 0.7,
    maxTokens: 2048,
    enableTools: true,
    includeSources: true,
    useSystemPrompt: true,
  },
  // New properties for file upload support
  uploadedFiles: [],
  isUploading: false,
  uploadProgress: 0,
};

// Action types
export const ActionTypes = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  COMPLETE_STREAMING_MESSAGE: 'COMPLETE_STREAMING_MESSAGE',
  UPDATE_STREAMING_MESSAGE: 'UPDATE_STREAMING_MESSAGE',
  CLEAR_STREAMING_MESSAGE: 'CLEAR_STREAMING_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_STREAMING: 'SET_STREAMING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_CURRENT_MODEL: 'SET_CURRENT_MODEL',
  SET_AVAILABLE_MODELS: 'SET_AVAILABLE_MODELS',
  SET_TOOLS: 'SET_TOOLS',
  ADD_TOOL_RESULT: 'ADD_TOOL_RESULT',
  SET_MODEL_INFO: 'SET_MODEL_INFO',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_CHAT: 'RESET_CHAT',
  // New action types for file upload
  SET_SESSION_ID: 'SET_SESSION_ID',
  ADD_UPLOADED_FILE: 'ADD_UPLOADED_FILE',
  SET_UPLOADING: 'SET_UPLOADING',
  SET_UPLOAD_PROGRESS: 'SET_UPLOAD_PROGRESS',
};

// Chat reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload,
      };

    case ActionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, {
          id: action.payload.id || generateMessageId(),
          timestamp: new Date().toISOString(),
          ...action.payload,
        }],
      };

    case ActionTypes.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.id 
            ? { ...msg, ...action.payload }
            : msg
        ),
      };

    case ActionTypes.COMPLETE_STREAMING_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.id 
            ? { ...msg, ...action.payload }
            : msg
        ),
        streamingMessage: '',
        isStreaming: false,
      };

    case ActionTypes.UPDATE_STREAMING_MESSAGE:
      return {
        ...state,
        streamingMessage: state.streamingMessage + action.payload,
      };

    case ActionTypes.CLEAR_STREAMING_MESSAGE:
      return {
        ...state,
        streamingMessage: '',
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ActionTypes.SET_STREAMING:
      return {
        ...state,
        isStreaming: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isStreaming: false,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload,
      };

    case ActionTypes.SET_CURRENT_MODEL:
      return {
        ...state,
        currentModel: action.payload,
      };

    case ActionTypes.SET_AVAILABLE_MODELS:
      return {
        ...state,
        availableModels: action.payload,
      };

    case ActionTypes.SET_TOOLS:
      return {
        ...state,
        tools: action.payload,
      };

    case ActionTypes.ADD_TOOL_RESULT:
      return {
        ...state,
        toolResults: {
          ...state.toolResults,
          [action.payload.id]: action.payload.result,
        },
      };

    case ActionTypes.SET_MODEL_INFO:
      return {
        ...state,
        modelInfo: action.payload,
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ActionTypes.RESET_CHAT:
      // Note: we don't reset the sessionId or uploadedFiles when clearing chat
      return {
        ...state,
        messages: [],
        streamingMessage: '',
        error: null,
        isLoading: false,
        isStreaming: false,
        toolResults: {},
      };

    // New file upload action handlers
    case ActionTypes.SET_SESSION_ID:
      // Store the new session ID in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('reportminer-session-id', action.payload);
      }
      return {
        ...state,
        sessionId: action.payload,
      };

    case ActionTypes.ADD_UPLOADED_FILE:
      return {
        ...state,
        uploadedFiles: [...state.uploadedFiles, action.payload],
      };

    case ActionTypes.SET_UPLOADING:
      return {
        ...state,
        isUploading: action.payload,
        // Reset upload progress when starting or completing upload
        uploadProgress: action.payload ? state.uploadProgress : 0,
      };

    case ActionTypes.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: action.payload,
      };

    default:
      return state;
  }
};

// Context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Store session ID in localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reportminer-session-id', state.sessionId);
    }
  }, [state.sessionId]);

  // Memoize helper functions to prevent unnecessary re-renders
  const addMessage = useCallback((message) => {
    dispatch({ type: ActionTypes.ADD_MESSAGE, payload: message });
  }, []);

  const updateMessage = useCallback((message) => {
    dispatch({ type: ActionTypes.UPDATE_MESSAGE, payload: message });
  }, []);

  const completeStreamingMessage = useCallback((message) => {
    dispatch({ type: ActionTypes.COMPLETE_STREAMING_MESSAGE, payload: message });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  }, []);

  const setStreaming = useCallback((streaming) => {
    dispatch({ type: ActionTypes.SET_STREAMING, payload: streaming });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  const updateStreamingMessage = useCallback((content) => {
    dispatch({ type: ActionTypes.UPDATE_STREAMING_MESSAGE, payload: content });
  }, []);

  const clearStreamingMessage = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_STREAMING_MESSAGE });
  }, []);

  const setConnectionStatus = useCallback((status) => {
    dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: status });
  }, []);

  const resetChat = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_CHAT });
  }, []);
  
  // New file upload helper functions
  const setSessionId = useCallback((sessionId) => {
    dispatch({ type: ActionTypes.SET_SESSION_ID, payload: sessionId });
  }, []);
  
  const addUploadedFile = useCallback((fileData) => {
    dispatch({ type: ActionTypes.ADD_UPLOADED_FILE, payload: fileData });
  }, []);
  
  const setUploading = useCallback((isUploading) => {
    dispatch({ type: ActionTypes.SET_UPLOADING, payload: isUploading });
  }, []);
  
  const setUploadProgress = useCallback((progress) => {
    dispatch({ type: ActionTypes.SET_UPLOAD_PROGRESS, payload: progress });
  }, []);
  
  // Create a new session
  const createNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    resetChat();
    return newSessionId;
  }, [setSessionId, resetChat]);

  const value = {
    state,
    dispatch,
    // Helper functions
    addMessage,
    updateMessage,
    completeStreamingMessage,
    setLoading,
    setStreaming,
    setError,
    clearError,
    updateStreamingMessage,
    clearStreamingMessage,
    setConnectionStatus,
    resetChat,
    // New file upload helper functions
    setSessionId,
    addUploadedFile,
    setUploading,
    setUploadProgress,
    createNewSession,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
