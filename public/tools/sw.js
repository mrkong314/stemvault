/* StemVault tools service worker.
 * Pre-caches the home-screen tools so they launch offline, then keeps the
 * cache fresh in the background (stale-while-revalidate). Only the URLs
 * listed in PRECACHE are handled; every other request passes straight to
 * the network, so the rest of /tools/ behaves exactly as before.
 *
 * Cloudflare Pages answers /tools/foo.html with a 308 to /tools/foo. A
 * response that arrived via a redirect carries a "redirected" flag, and
 * Safari refuses to accept such a response from a service worker for a
 * navigation ("Response served by service worker has redirections").
 * Every response is therefore rebuilt as a plain 200 before it is cached
 * or served, and the extensionless URLs are treated as aliases of the
 * .html entries so both forms work offline.
 */
var CACHE = 'stemvault-tools-v2';

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

// Map a request path to its cache key: /tools/foo and /tools/foo/ resolve
// to /tools/foo.html. Returns null for anything we do not handle.
function cacheKey(pathname) {
  if (PRECACHE.indexOf(pathname) !== -1) return pathname;
  var bare = pathname.replace(/\/$/, '');
  if (PRECACHE.indexOf(bare + '.html') !== -1) return bare + '.html';
  return null;
}

// Return a copy of the response with no redirect history and no "url",
// so browsers accept it for navigation requests.
function sanitise(res) {
  if (!res.redirected) return Promise.resolve(res);
  return res.blob().then(function (body) {
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers
    });
  });
}

// Fetch a URL fresh from the network, following redirects, and return a
// response that is safe to cache and to serve.
function fetchClean(key) {
  return fetch(key, { cache: 'no-cache', redirect: 'follow' }).then(function (res) {
    if (!res || !res.ok) throw new Error('bad response');
    return sanitise(res);
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Fetch each entry individually so one failure does not block install.
      return Promise.all(PRECACHE.map(function (url) {
        return fetchClean(url).then(function (res) {
          return cache.put(url, res);
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
  var key = cacheKey(url.pathname);
  if (!key) return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(key).then(function (cached) {
        var network = fetchClean(key).then(function (res) {
          cache.put(key, res.clone());
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
