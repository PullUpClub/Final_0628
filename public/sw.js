// Service Worker for Pull-Up Club — cookie-based auth compatible
const CACHE_NAME = 'pullup-club-nextjs'
const BUILD_ID = self.location.search.includes('buildId=') ?
  new URLSearchParams(self.location.search).get('buildId') : Date.now().toString()

console.log('[SW] Pull-Up Club Service Worker initialized with BUILD_ID:', BUILD_ID)

// Install event — skip waiting for immediate activation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker with BUILD_ID:', BUILD_ID)
  event.waitUntil(self.skipWaiting())
})

// Activate event — clear ALL existing caches to flush stale HTML
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating — clearing all caches to flush stale HTML...')
  event.waitUntil(
    Promise.all([
      // Clear every cache so users never get stale logged-out HTML
      caches.keys().then(names =>
        Promise.all(names.map(name => {
          console.log('[SW] Deleting cache:', name)
          return caches.delete(name)
        }))
      ),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activated — all old caches cleared')
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_CLEANED',
            message: 'Old caches cleared, you have the latest version'
          })
        })
      })
    })
  )
})

// Fetch event — network-only for documents, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return

  // Skip API routes and Next.js internals
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/_next/webpack-hmr') ||
      url.pathname.startsWith('/auth/callback') ||
      url.pathname.includes('hot-update')) {
    return
  }

  // Documents/navigation: ALWAYS go to network (never serve stale HTML)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection and try again.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      })
    )
    return
  }

  // Static assets (JS, CSS, images): cache-first
  if (url.pathname.startsWith('/_next/static/') ||
      request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME + '-static').then(cache => {
              cache.put(request, clone)
            })
          }
          return response
        })
      }).catch(() => new Response('', { status: 503 }))
    )
    return
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then(r => r || new Response('', { status: 503 })))
  )
})

// Message event — handle commands from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
      case 'CLEAR_CACHE':
        event.waitUntil(
          caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
        )
        break
    }
  }
})
