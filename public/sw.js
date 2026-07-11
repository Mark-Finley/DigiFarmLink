const CACHE_NAME = 'farmlink-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/login',
  '/register',
  '/marketplace',
  '/cart',
  '/icon.svg',
  '/manifest.json'
];

// Install event: cache precached assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add all assets to cache, catch errors individually to avoid failing entirely
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn(`Failed to precache asset ${asset}:`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate event: clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first for pages and dynamic assets, Cache-first for static files
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip requests that shouldn't be handled (non-GET, API routes, hot reload routes, Supabase calls)
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/_next/webpack-hmr') ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }

  // Network-First for Navigation (Pages) and Data routes
  if (request.mode === 'navigate' || url.pathname.startsWith('/_next/data')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseCopy);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, return from cache or serve index fallback
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/');
          });
        })
    );
  } else {
    // Cache-First for static resources (JS chunks, CSS, fonts, images)
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Only cache standard successful responses
          if (response && response.status === 200 && response.type === 'basic') {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseCopy);
            });
          }
          return response;
        }).catch(() => {
          // Fallback if offline and asset not in cache
          return new Response('Offline asset not available', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
    );
  }
});
