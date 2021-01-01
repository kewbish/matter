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
    .then(res => {
        caches.open('matter')
        .then(cache => {
            cache.put(ins.request.url, res.clone());
            return res;
        })
    })
    .catch(() => {
        return caches.match(event.request);
    })
    .then(res => {
        if (res === undefined) {
            return cache.match("index.html");
        }
        return res;
    })
  );
});
