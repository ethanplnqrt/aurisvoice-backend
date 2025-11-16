// Hook to detect offline status
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is currently offline
 * @returns {boolean} true if offline, false if online
 */
export function useIsOffline(): boolean {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initialize with current status
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

/**
 * Hook to get online status (opposite of useIsOffline)
 * @returns {boolean} true if online, false if offline
 */
export function useIsOnline(): boolean {
  const isOffline = useIsOffline();
  return !isOffline;
}

