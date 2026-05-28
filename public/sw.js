const CACHE_NAME = 'copa-figurinhas-v1'

const BASE = '/copa-figurinhas'

const STATIC_ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
  BASE + '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET e do Firebase
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('firestore') || event.request.url.includes('firebase')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      return cached || network
    })
  )
})
