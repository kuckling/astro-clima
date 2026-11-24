/* Service worker del tablero El Arado: guarda la cáscara de la app para abrirla sin internet.
   Los datos (ThingSpeak y Open-Meteo) siempre se piden a la red; sin conexión la página
   muestra el último estado que tenía en pantalla. */
const CACHE = 'el-arado-v1';
const SHELL = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url);
    // Los datos en vivo nunca se sirven del caché.
    if (url.hostname.indexOf('thingspeak.com') !== -1 || url.hostname.indexOf('open-meteo.com') !== -1) return;
    event.respondWith(
        caches.match(event.request).then(function (cached) {
            return cached || fetch(event.request);
        })
    );
});
