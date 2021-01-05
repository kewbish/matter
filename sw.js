const files = [
    './',
    './index.html',
    'https://kewbi.sh/css/main.css',
    'https://fonts.googleapis.com/css2?family=Montserrat&display=swap',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap&text=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    'https://kewbi.sh/Back1.svg',
    'https://kewbi.sh/Back2.svg',
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

const fromNetwork = (req, timeout) =>
  new Promise((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(req).then(res => {
      clearTimeout(timeoutId);
      fulfill(res);
      update(req);
    }, reject);
  });

const fromCache = req =>
  caches.open('matter')
  .then(cache =>
    cache.match(req)
    .then(matching => matching || cache.match('index.html'))
  );

const update = req =>
  caches.open('matter')
  .then(cache =>
    fetch(req).then(res => cache.put(req, res))
  );

self.addEventListener('fetch', ins => {
  ins.respondWith(
    fromNetwork(ins.request, 5000).catch(() => fromCache(ins.request)));
  ins.waitUntil(update(ins.request));
});
