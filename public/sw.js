// Minimal Service Worker
// Required for PWA installability criteria

const CACHE_NAME = 'filmlab-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for now
  event.respondWith(fetch(event.request));
});
