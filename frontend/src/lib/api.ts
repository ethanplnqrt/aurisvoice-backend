/**
 * API Client for AurisVoice Backend
 */

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Check backend health status
 */
export async function checkStatus(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_URL}/status`);
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error('Status check failed:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload a file for dubbing (placeholder endpoint - deprecated)
 */
export async function uploadFile(
  file: File,
  sourceLanguage: string,
  targetLanguage: string
): Promise<ApiResponse> {
  // Redirect to new generateDub function
  return generateDub(file, targetLanguage, sourceLanguage);
}

/**
 * Generate AI dub for uploaded file
 * @param file - Audio or video file to dub
 * @param targetLanguage - Target language code (fr, en, es, etc.)
 * @param sourceLanguage - Source language code (optional)
 * @returns Promise with audio URL or error
 */
export async function generateDub(
  file: File,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<ApiResponse> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 50MB.');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLanguage', targetLanguage);
    if (sourceLanguage) {
      formData.append('sourceLanguage', sourceLanguage);
    }

    console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`🌍 Target language: ${targetLanguage}`);

    // Send request to backend
    const response = await fetch(`${API_URL}/api/dub`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate dub');
    }

    console.log('✅ Dub generated successfully:', data);

    // Convert relative URL to absolute URL if needed
    if (data.audioUrl && !data.audioUrl.startsWith('http')) {
      data.audioUrl = `${API_URL}${data.audioUrl}`;
    }

    return { ok: true, data };
  } catch (error) {
    console.error('❌ Dub generation failed:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to generate dub',
    };
  }
}

/**
 * Helper function to handle API errors
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

