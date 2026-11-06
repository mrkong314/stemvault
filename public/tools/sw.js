/* StemVault tools service worker.
 * Pre-caches the home-screen tools so they launch offline, then keeps the
 * cache fresh in the background (stale-while-revalidate). Only the URLs
 * listed in PRECACHE are handled; every other request passes straight to
 * the network, so the rest of /tools/ behaves exactly as before.
 */
var CACHE = 'stemvault-tools-v1';

var PRECACHE = [
  '/tools/class-timer.html',
  '/tools/class-timer.webmanifest',
  '/tools/class-timer-icon-180.png',
  '/tools/class-timer-icon-192.png',
  '/tools/class-timer-icon-512.png',
  '/tools/notepad.html',
  '/tools/notepad.webmanifest',
  '/tools/notepad-green-180.png',
  '/tools/notepad-green-192.png',
  '/tools/notepad-green-512.png',
  '/tools/calculator.html',
  '/tools/calculator.webmanifest',
  '/tools/calculator-icon-180.png',
  '/tools/calculator-icon-192.png',
  '/tools/calculator-icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Fetch each entry individually so one failure does not block install.
      return Promise.all(PRECACHE.map(function (url) {
        return fetch(url, { cache: 'no-cache' }).then(function (res) {
          if (res && res.ok) return cache.put(url, res);
        }).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE) return caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (PRECACHE.indexOf(url.pathname) === -1) return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(url.pathname).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(url.pathname, res.clone());
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
