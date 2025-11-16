// AurisVoice Service Worker
// Advanced PWA caching strategy with offline support

const CACHE_NAME = 'aurisvoice-cache-v2';
const OFFLINE_PAGE = '/offline';

// Routes to precache on install
const ROUTES_TO_CACHE = [
  '/',
  '/credits',
  '/dashboard',
  '/payment/success',
  '/payment/cancel',
  '/about',
  '/history',
  '/offline' // Offline fallback page
];

// Static asset patterns to cache dynamically
const STATIC_ASSET_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.webp$/,
  /_next\/static\//, // Next.js static assets
];

// Paths to NEVER cache or intercept
const BLOCKED_PATHS = [
  '/api/',      // All API endpoints (Stripe, dubbing)
  '/checkout/', // Stripe checkout
  '/payment/',  // Payment pages (but we cache success/cancel for UI)
];

/**
 * Check if a URL should be blocked from caching
 */
function isBlocked(url) {
  return BLOCKED_PATHS.some(path => url.pathname.startsWith(path));
}

/**
 * Check if a URL is a static asset
 */
function isStaticAsset(url) {
  return STATIC_ASSET_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Check if a request is for an HTML page
 */
function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html') || 
         request.destination === 'document';
}

// Install event - Precache routes
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching routes:', ROUTES_TO_CACHE);
        // Cache routes, but don't fail if some fail
        return Promise.allSettled(
          ROUTES_TO_CACHE.map(route => 
            cache.add(new Request(route, { credentials: 'same-origin' }))
              .catch(err => {
                console.warn(`[SW] Failed to cache ${route}:`, err);
                return null;
              })
          )
        );
      })
      .then(() => {
        console.log('[SW] Precache complete');
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const deletePromises = cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      });
      
      // Also clean up old cache versions (aurisvoice-cache-v1, etc.)
      const oldCachePattern = /^aurisvoice-cache-v\d+$/;
      cacheNames.forEach((cacheName) => {
        if (oldCachePattern.test(cacheName) && cacheName !== CACHE_NAME) {
          console.log('[SW] Deleting old version cache:', cacheName);
          deletePromises.push(caches.delete(cacheName));
        }
      });
      
      return Promise.all(deletePromises);
    })
    .then(() => {
      console.log('[SW] Cache cleanup complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - Advanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (different origin)
  if (url.origin !== location.origin) {
    return;
  }

  // NEVER cache or intercept API endpoints, checkout, or payment processing
  if (isBlocked(url)) {
    console.log('[SW] Blocked path, letting browser handle:', url.pathname);
    return; // Let browser handle normally - no caching, no interception
  }

  // Handle HTML pages (cache-first with network fallback)
  if (isHTMLRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Try network first for HTML
          return fetch(request)
            .then((networkResponse) => {
              // Cache successful responses
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Network failed - return cached version if available
              if (cachedResponse) {
                console.log('[SW] Serving cached HTML:', url.pathname);
                return cachedResponse;
              }
              // No cache - return offline page
              console.log('[SW] No cache, serving offline page');
              return caches.match(OFFLINE_PAGE).catch(() => {
                // If offline page is not cached, return a basic response
                return new Response(
                  '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>Vous êtes hors ligne</h1><p>Veuillez vérifier votre connexion.</p></body></html>',
                  { headers: { 'Content-Type': 'text/html' } }
                );
              });
            });
        })
        .catch(() => {
          // Fallback to offline page if everything fails
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // Handle static assets (cache-first strategy)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version immediately
            return cachedResponse;
          }

          // Not in cache - fetch from network
          return fetch(request)
            .then((response) => {
              // Only cache successful responses
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            })
            .catch(() => {
              // Network failed and no cache - try fallback for icons
              if (url.pathname.startsWith('/icons/')) {
                // Try to return a default icon or empty response
                console.log('[SW] Icon not available:', url.pathname);
                return new Response('', {
                  status: 404,
                  statusText: 'Icon not found'
                });
              }
              // Browser will handle the error
              return new Response('Resource not available offline', {
                status: 408,
                statusText: 'Request Timeout'
              });
            });
        })
    );
    return;
  }

  // For other requests, use network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(request);
      })
  );
});
