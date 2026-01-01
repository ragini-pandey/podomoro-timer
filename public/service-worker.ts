/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

const BACKGROUND_CACHE = 'pomodoro-backgrounds-v1';

// Precache assets from the build
precacheAndRoute(self.__WB_MANIFEST);

// Install event
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== BACKGROUND_CACHE && !cacheName.startsWith('workbox-precache')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle background images from Unsplash
  if (url.hostname === 'images.unsplash.com') {
    event.respondWith(
      caches.open(BACKGROUND_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((networkResponse) => {
            // Cache the image for future use
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return a fallback or empty response if offline
            return new Response('Offline - image not available', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
        });
      })
    );
    return;
  }

  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request);
    })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'CACHE_BACKGROUNDS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(BACKGROUND_CACHE).then((cache) => {
        return Promise.all(
          urls.map((url: string) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((error) => {
                console.error(`Failed to cache: ${url}`, error);
              })
          )
        );
      })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

export {};
