/* StemVault tools service worker: kill switch.
 * The offline worker that used to live here is withdrawn. Devices that
 * still have it installed fetch this file on their next visit; it takes
 * over immediately, deletes the old caches, unregisters itself and
 * reloads any open tool page so it is served straight from the network.
 * It handles no fetch events, so nothing is intercepted in the meantime.
 */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) { return caches.delete(key); }));
    }).then(function () {
      return self.registration.unregister();
    }).then(function () {
      return self.clients.matchAll({ type: 'window' });
    }).then(function (clients) {
      clients.forEach(function (client) { client.navigate(client.url); });
    })
  );
});
