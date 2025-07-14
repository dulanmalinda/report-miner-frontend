# ReportMiner API Integration Plan

## Current Status: Implementation Phase

## Overview
Integrate the frontend with the new ReportMiner REST API endpoints instead of using Ollama directly:
- Chat messages: `http://localhost:8000/api/query/chat/query/`
- File uploads: `http://localhost:8000/api/query/chat/upload/`

## Implementation Tasks

### 1. Backend API Service [✅ Completed]
- Created `reportMinerApi.js` utility with error handling
- Implemented query function for chat messages
- Implemented file upload function with progress tracking
- Added connection checking and error handling

### 2. State Management [✅ Completed]
- Updated `ChatContext.jsx` with new state for:
  - Session ID management with localStorage persistence
  - Uploaded files tracking
  - File upload progress/status
  - API settings (include tools, sources)
  - Added new session creation functionality

### 3. File Upload UI [✅ Completed]
- Created FileUpload component with dedicated CSS
- Added file selection with preview
- Implemented upload progress indicator
- Added file details display after upload

### 4. Message Input Enhancement [✅ Completed]
- Added file upload button to MessageInput
- Integrated file upload with message sending
- Added file selection and validation
- Implemented upload status in the UI
- Updated CSS for better appearance

### 5. Message Display Updates [✅ Completed]
- Updated MessageBubble to display:
  - File upload results with file details
  - Sources from API responses (collapsible)
  - Tools used information
  - Confidence scores
  - Processing time and other metadata

### 6. Chat Hook Refactoring [✅ Completed]
- Created new `useReportMinerChat` hook dedicated to ReportMiner API
- Completely removed Ollama dependencies
- Implemented session management
- Added file uploads within the conversation flow

### 7. Testing & Refinement [⏳ Not Started]
- Test message sending
- Test file uploads
- Verify source display
- Check tool usage display
- Test error handling

## API Specifications

### Chat Query Endpoint
- URL: `http://localhost:8000/api/query/chat/query/`
- Method: POST
- Body:
```json
{
    "question": "Ask a question about the data",
    "include_tools": true,
    "include_sources": true,
    "session_id": "unique_session_id"
}
```
- Response format:
```json
{
    "success": true,
    "message": "Response content...",
    "sources": [],
    "tools_used": ["rag_query", "generate_insights"],
    "confidence": 1.0,
    "session_id": "unique_session_id",
    "processing_time": 23.15,
    "timestamp": 1752508579,
    "metadata": {
        "sources_found": 0,
        "response_type": "orchestrated",
        "model_used": "gpt-4o",
        "tools_executed": 2
    }
}
```

### File Upload Endpoint
- URL: `http://localhost:8000/api/query/chat/upload/`
- Method: POST
- Content-Type: multipart/form-data
- Form fields:
  - filename: Name for the file
  - file: The file to upload
  - type: File type/MIME type
- Response format:
```json
{
    "success": true,
    "message": "Document uploaded and processed successfully",
    "data": {
        "document_id": "aabd3b67-644e-467e-9c29-e31478181182",
        "filename": "laptop",
        "file_type": "csv",
        "status": "completed",
        "processing_results": {
            "text_segments": 0,
            "embeddings": 29,
            "tables": 0,
            "key_values": 90
        },
        "ready_for_queries": true
    },
    "timestamp": 1752508457
}
```

## Implementation Notes
- Removed all Ollama dependencies completely
- Using session ID to maintain conversation context across page refreshes
- Added file upload progress with appropriate UI feedback
- Implemented sources and tool usage display for transparency
- Created a clean, modern UI for the chat interface

## Next Steps
1. Complete testing of all implemented features
2. Fine-tune UI/UX based on testing feedback
3. Add documentation on how to use the new features
4. Implement any necessary performance optimizations
