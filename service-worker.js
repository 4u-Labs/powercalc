const SCOPE=new URL(self.registration.scope);
const PREFIX='powercalc-'+encodeURIComponent(SCOPE.pathname)+'-';const CACHE=PREFIX+'2.1.0';
const ASSETS=['./','index.php','app.php','style.css?v=2.1.0','app.js?v=2.1.0','reliability.js?v=2.1.0','usability.js?v=2.1.0','manifest.json','privacy.html','terms.html','support.html','assets/icon16.png','assets/icon48.png','assets/icon128.png','assets/icon192.png','assets/icon512.png'];
const urls=ASSETS.map(path=>new URL(path,SCOPE).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls)).catch(async error=>{await caches.delete(CACHE);throw error;})));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname)||!urls.includes(url.href))return;event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request);if(cached)return cached;return fetch(event.request);})());});
