const CACHE='shk-din-v3-praxis';
const ASSETS=["./", "./index.html", "./app.js", "./questions.js", "./practice.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./praxis-01.webp", "./praxis-02.webp", "./praxis-03.webp", "./praxis-04.webp", "./praxis-05.webp", "./praxis-06.webp", "./praxis-07.webp", "./praxis-08.webp", "./praxis-09.webp", "./praxis-10.webp"];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
