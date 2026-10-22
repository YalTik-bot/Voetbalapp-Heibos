// Bewaart een kopie van de app zodat ze ook zonder internet opent.
// Met internet wordt altijd eerst de nieuwste versie opgehaald (en de kopie bijgewerkt).
const CACHE="heibos-v14";
const FILES=["./","index.html","style.css?v=14","app.js?v=14","logo.jpg","manifest.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!=CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const req=e.request;if(req.method!="GET"||new URL(req.url).origin!=location.origin)return;
 e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})
  .catch(()=>caches.match(req).then(r=>r||caches.match(req,{ignoreSearch:true})).then(r=>r||(req.mode=="navigate"?caches.match("index.html"):undefined))));
});
