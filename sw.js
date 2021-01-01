const files = [
    './',
    './index.html',
    './main.css',
    './main.js',
    'assets/matter192.png',
    'assets/matter512.png',
]

self.addEventListener('install', ins => {
  ins.waitUntil(
    caches.open('matter').then(cache => {
      return cache.addAll(files);
    }),
  );
});

self.addEventListener('fetch', ins => {
  ins.respondWith(
    fetch(ins.request)
    .catch(() => caches.open('matter')
    .then(cache => cache.match(ins.request)))
  );
});
