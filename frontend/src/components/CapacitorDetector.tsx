'use client';

import { useEffect } from 'react';
import { getCapacitorInfo, onCapacitorReady, shouldActivateServiceWorker } from '@/lib/capacitor';

/**
 * Component to detect Capacitor and apply iOS safe areas
 */
export function CapacitorDetector() {
  useEffect(() => {
    // Detect Capacitor and platform
    const info = getCapacitorInfo();
    console.log('[Capacitor] Device info:', info);
    
    // Apply iOS safe area classes conditionally
    if (info.platform === 'ios') {
      const root = document.documentElement;
      root.classList.add('ios-device');
      
      // Apply safe area to body
      document.body.classList.add('ios-safe-area');
      
      // Apply safe area to header if exists
      const header = document.querySelector('header, nav, [role="banner"]');
      if (header) {
        header.classList.add('ios-safe-area-header');
      }
      
      // Apply safe area to main content
      const main = document.querySelector('main, [role="main"]');
      if (main) {
        main.classList.add('ios-safe-area-content');
      }
      
      // Apply safe area to footer if exists
      const footer = document.querySelector('footer, [role="contentinfo"]');
      if (footer) {
        footer.classList.add('ios-safe-area-footer');
      }
    }
    
    // Listen for Capacitor ready
    onCapacitorReady(() => {
      console.log('[Capacitor] Ready');
      
      // Verify service worker activation
      if (shouldActivateServiceWorker()) {
        console.log('[Capacitor] Service worker should be active');
      } else {
        console.warn('[Capacitor] Service worker may not work in this environment');
      }
    });
    
    // Fallback offline page check
    if (info.isWebView) {
      // In WebView, ensure offline.html is accessible
      const offlinePath = '/offline';
      fetch(offlinePath, { method: 'HEAD' })
        .then(() => {
          console.log('[Capacitor] Offline page accessible');
        })
        .catch(() => {
          console.warn('[Capacitor] Offline page not accessible, creating fallback');
          // Could create a minimal offline page if needed
        });
    }
  }, []);
  
  return null; // This component doesn't render anything
}

