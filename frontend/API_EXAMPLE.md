# AurisVoice API Integration Examples 🔌

This guide shows how to integrate the AurisVoice backend API with the frontend.

## Backend Status Check

### Basic Example

```typescript
import { checkStatus } from '@/lib/api';

async function testConnection() {
  const result = await checkStatus();
  
  if (result.ok) {
    console.log('✅ Connected:', result.data);
    // Output: { ok: true, message: "AurisVoice backend is running 🚀" }
  } else {
    console.error('❌ Error:', result.error);
  }
}
```

### React Component Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { checkStatus } from '@/lib/api';

export function BackendStatus() {
  const [status, setStatus] = useState<string>('Checking...');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    async function check() {
      const result = await checkStatus();
      
      if (result.ok) {
        setStatus(result.data.message);
        setIsConnected(true);
      } else {
        setStatus('Backend disconnected');
        setIsConnected(false);
      }
    }
    
    check();
  }, []);

  return (
    <div className={`p-4 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
      <p className="font-semibold">
        {isConnected ? '🟢' : '🔴'} {status}
      </p>
    </div>
  );
}
```

---

## File Upload (Placeholder)

### Basic Upload

```typescript
import { uploadFile } from '@/lib/api';

async function handleUpload(file: File) {
  const result = await uploadFile(file, 'fr', 'en');
  
  if (result.ok) {
    console.log('✅ Upload successful:', result.data);
  } else {
    console.error('❌ Upload failed:', result.error);
  }
}
```

### React Component with Progress

```typescript
'use client';

import { useState } from 'react';
import { uploadFile } from '@/lib/api';
import { FileUpload } from '@/components/FileUpload';

export function DubbingUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);
    
    try {
      const uploadResult = await uploadFile(file, 'fr', 'en');
      
      clearInterval(interval);
      setProgress(100);
      
      if (uploadResult.ok) {
        setResult('Success! Your dub is ready.');
      } else {
        setResult('Error: ' + uploadResult.error);
      }
    } catch (error) {
      clearInterval(interval);
      setResult('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUpload onFileSelect={setFile} />
      
      <button
        onClick={handleGenerate}
        disabled={!file || isUploading}
        className="w-full py-3 bg-primary-600 text-white rounded-lg disabled:bg-gray-400"
      >
        {isUploading ? `Uploading... ${progress}%` : 'Generate Dub'}
      </button>
      
      {result && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Direct fetch() Examples

### GET Request - Status Check

```typescript
// Simple status check
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:3000/status');
    const data = await response.json();
    
    console.log(data);
    // { ok: true, message: "AurisVoice backend is running 🚀" }
  } catch (error) {
    console.error('Backend unavailable:', error);
  }
}
```

### POST Request - File Upload

```typescript
async function uploadAudio(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sourceLanguage', 'fr');
  formData.append('targetLanguage', 'en');

  try {
    const response = await fetch('http://localhost:3000/dub', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}
```

---

## Error Handling

### Comprehensive Error Handler

```typescript
import { handleApiError } from '@/lib/api';

async function safeApiCall() {
  try {
    const result = await checkStatus();
    
    if (!result.ok) {
      throw new Error(result.error);
    }
    
    return result.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error('API Error:', errorMessage);
    
    // Show user-friendly message
    alert(errorMessage);
    
    return null;
  }
}
```

### React Error Boundary

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('API Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Connection Error
          </h2>
          <p className="text-red-700">
            {this.state.error?.message || 'Something went wrong'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Environment-Aware API Client

### Dynamic API URL

```typescript
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.aurisvoice.com';
  }
  return 'http://localhost:3000';
};

export async function apiRequest(endpoint: string, options = {}) {
  const url = `${getApiUrl()}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}
```

---

## Testing API Calls

### Manual Browser Test

Open browser console (F12) and run:

```javascript
// Test 1: Status check
fetch('http://localhost:3000/status')
  .then(r => r.json())
  .then(d => console.log('✅ Status:', d))
  .catch(e => console.error('❌ Error:', e));

// Test 2: CORS check
fetch('http://localhost:3000/status', {
  method: 'GET',
  mode: 'cors',
})
  .then(r => console.log('✅ CORS OK'))
  .catch(e => console.error('❌ CORS Error:', e));
```

### Automated Test Script

```typescript
// test-api.ts
import { checkStatus } from '@/lib/api';

async function runTests() {
  console.log('🧪 Running API tests...\n');
  
  // Test 1: Backend Status
  console.log('Test 1: Backend Status');
  const statusResult = await checkStatus();
  console.log(statusResult.ok ? '✅ PASS' : '❌ FAIL');
  console.log('Response:', statusResult);
  console.log('');
  
  // Add more tests here...
  
  console.log('🏁 Tests complete!');
}

runTests();
```

---

## API Response Types

### TypeScript Interfaces

```typescript
// Status response
interface StatusResponse {
  ok: boolean;
  message: string;
}

// Upload response (future)
interface UploadResponse {
  ok: boolean;
  jobId: string;
  estimatedTime: number;
}

// Error response
interface ErrorResponse {
  ok: false;
  error: string;
  code?: string;
}

// Generic API response
interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}
```

---

## Real-World Integration Example

### Complete Page with API

```typescript
'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { checkStatus, uploadFile } from '@/lib/api';
import { FileUpload } from '@/components/FileUpload';

export default function DubbingPage() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check backend on mount
  useEffect(() => {
    async function init() {
      const result = await checkStatus();
      setBackendStatus(
        result.ok ? '🟢 Connected' : '🔴 Disconnected'
      );
    }
    init();
  }, []);

  const handleGenerate = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    const result = await uploadFile(file, 'fr', 'en');
    
    if (result.ok) {
      alert('Success! Dub generated.');
    } else {
      alert('Error: ' + result.error);
    }
    
    setIsProcessing(false);
  };

  return (
    <>
      <Head>
        <title>Dubbing - AurisVoice</title>
      </Head>
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Backend Status */}
        <div className="mb-6 text-sm text-gray-600">
          Status: {backendStatus}
        </div>
        
        {/* Upload Interface */}
        <FileUpload onFileSelect={setFile} />
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!file || isProcessing}
          className="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg"
        >
          {isProcessing ? 'Processing...' : 'Generate Dub'}
        </button>
      </div>
    </>
  );
}
```

---

## cURL Examples

### Test from Terminal

```bash
# Test status endpoint
curl http://localhost:3000/status

# Expected response:
# {"ok":true,"message":"AurisVoice backend is running 🚀"}

# Test with verbose output
curl -v http://localhost:3000/status

# Test CORS headers
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/status
```

---

## Available Endpoints

### Current (Backend v1.0)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/` | Welcome page | ✅ Live |
| GET | `/status` | Health check | ✅ Live |

### Planned (Future)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/dub` | Upload for dubbing | 🔜 Coming |
| GET | `/dub/:id` | Get dub status | 🔜 Coming |
| GET | `/dub/:id/download` | Download result | 🔜 Coming |

---

## Best Practices

1. **Always handle errors** - Use try/catch
2. **Show loading states** - Keep users informed
3. **Validate before sending** - Check file types/sizes
4. **Use TypeScript** - Type safety prevents errors
5. **Cache when possible** - Reduce API calls
6. **Log errors** - Help with debugging
7. **Test thoroughly** - Manual + automated tests

---

## Troubleshooting

### CORS Errors

**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**: Ensure backend has CORS enabled (it does by default)

### Network Errors

**Problem**: "Failed to fetch" or "Network error"

**Solution**: 
1. Check backend is running
2. Verify API URL in `.env.local`
3. Check firewall settings

### Type Errors

**Problem**: TypeScript type mismatches

**Solution**: Update interfaces in `src/lib/api.ts`

---

**Happy integrating! 🔌✨**

