import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate audio/video file type
 */
export function isValidMediaFile(file: File): boolean {
  const validTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'video/mp4',
    'video/avi',
    'video/x-msvideo',
  ];
  
  return validTypes.includes(file.type);
}

/**
 * Get browser language
 */
export function getBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'fr';
  
  const language = navigator.language.split('-')[0];
  return ['fr', 'en', 'es'].includes(language) ? language : 'fr';
}

