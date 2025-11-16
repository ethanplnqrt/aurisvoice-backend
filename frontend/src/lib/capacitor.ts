// Capacitor detection and utilities

export interface CapacitorInfo {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  isWebView: boolean;
  isStandalone: boolean;
  isPWA: boolean;
}

/**
 * Detect if running in Capacitor
 */
export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor;
}

/**
 * Detect platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const capacitor = (window as any).Capacitor;
  if (capacitor) {
    return capacitor.getPlatform() as 'ios' | 'android' | 'web';
  }
  
  // Fallback detection
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'ios';
  }
  if (ua.includes('android')) {
    return 'android';
  }
  
  return 'web';
}

/**
 * Detect if running in WebView
 */
export function isWebView(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Capacitor detection
  if (isCapacitor()) {
    return true;
  }
  
  // User agent detection
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('wv') || // Android WebView
         (ua.includes('iphone') && !(window as any).safari) || // iOS WebView
         (ua.includes('ipad') && !(window as any).safari);
}

/**
 * Detect if running as standalone (PWA installed)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  // iOS
  if ((window.navigator as any).standalone) {
    return true;
  }
  
  // Android/Chrome
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  return false;
}

/**
 * Detect if running as PWA
 */
export function isPWA(): boolean {
  return isStandalone() && !isWebView();
}

/**
 * Get complete device info
 */
export function getCapacitorInfo(): CapacitorInfo {
  const platform = getPlatform();
  const native = isCapacitor();
  const webView = isWebView();
  const standalone = isStandalone();
  const pwa = isPWA();
  
  return {
    isNative: native,
    platform,
    isWebView: webView,
    isStandalone: standalone,
    isPWA: pwa,
  };
}

/**
 * Listen for Capacitor ready event
 */
export function onCapacitorReady(callback: () => void): void {
  if (typeof window === 'undefined') return;
  
  const capacitor = (window as any).Capacitor;
  if (capacitor && capacitor.Plugins) {
    // Capacitor is already ready
    callback();
  } else {
    // Wait for Capacitor to be ready
    window.addEventListener('DOMContentLoaded', callback);
  }
}

/**
 * Check if service worker should be active in WebView
 */
export function shouldActivateServiceWorker(): boolean {
  // Service worker works in Capacitor WebView
  if (isCapacitor()) {
    return true;
  }
  
  // Service worker works in PWA
  if (isPWA()) {
    return true;
  }
  
  // Service worker works in regular browser
  return 'serviceWorker' in navigator;
}

