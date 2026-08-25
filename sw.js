const CACHE='shk-meister-v4-2-zebra-logo-20260825';
const CORE=['./','./index.html','./app.js','./questions.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const IMAGES=["./meister-schema-01-fehlanschluss-heizkoerper.png", "./meister-schema-02-kaskade-puffer-trennung.png", "./meister-schema-03-pellet-puffer-speicher.png", "./meister-schema-04-kessel-heizkreise-boiler.png", "./meister-schema-05-heizung-hydraulik-befuellung.png", "./meister-schema-06-mehrgeschoss-riser.png", "./meister-schema-07-heizung-solar.png", "./meister-schema-08-heizung-sanitaer.png", "./meister-schema-09-heizkreise-warmwasser.png", "./meister-schema-10-fehlerhafte-befuellung.png", "./praxis-01.webp", "./praxis-02.webp", "./praxis-03.webp", "./praxis-04.webp", "./praxis-05.webp", "./praxis-06.webp", "./praxis-07.webp", "./praxis-08.webp", "./praxis-09.webp", "./praxis-10.webp", "./schema-heizung-01-pumpe-falschrum.png", "./schema-heizung-02-sicherheitsventil-ablauf-geschlossen.png", "./schema-heizung-03-heizungsbefuellung-dauerverbindung.png", "./schema-heizung-04-fussbodenheizung-ohne-mischer.png", "./schema-heizung-05-membran-ausdehnungsgefaess-falsch.png", "./schema-heizung-06-pufferspeicher-bypass.png", "./schema-heizung-07-strangschema-fehlanschluss-radiator.png", "./schema-heizung-08-zweikreis-ohne-hydraulische-weiche.png", "./schema-heizung-09-speicherladung-pumpe-falsch-angeordnet.png", "./schema-heizung-10-blindes-steigleitungsende.png", "./trgi-01-hausinstallation-reihenfolge.png", "./trgi-02-pruefungen-gebrauchsfaehigkeit.png", "./trgi-03-kategorien-uebersicht.png", "./trgi-04-bauart-a-a1-a2-a3.png", "./trgi-05-bauart-b1-b2-untergruppen.png", "./trgi-06-bauart-b3-b4-b5.png", "./trgi-07-bauart-c1-c3-c4.png", "./trgi-08-bauart-c5-c6-c8-c9.png", "./trgi-09-stroemungssicherung.png", "./trgi-10-meistertraining-gasgeraete.png", "./trgi-13-meisteruebersicht-gasinstallation.png", "./tw-pro-01-hochhaus-druckzonen.png", "./tw-pro-02-zirkulation-strangregulierung.png", "./tw-pro-03-labor-en1717-kat5.png", "./tw-pro-04-regenwasser-systemtrennung.png", "./tw-pro-05-hausanschluss-filter-druckminderer.png", "./tw-pro-06-tww-speicher-sicherheitsgruppe.png", "./tw-pro-07-installationsschacht-waermeschutz.png", "./tw-pro-08-mehrstrang-stagnation.png", "./tw-pro-09-inbetriebnahme-druckpruefung-spuelen.png", "./tw-pro-10-klinik-praxisversorgung.png", "./wp-schema-01-hybrid-solar-puffer-dhw.png", "./wp-schema-02-hausanlage-fbh-ohne-mischer.png", "./wp-schema-03-bivalent-wp-gaskessel.png", "./wp-schema-04-wp-schwimmbad-puffer-trinkwasser.png", "./wp-schema-05-wp-dhw-zirkulation-gemischter-kreis.png", "./wp-schema-06-mehrgeschossverteilung-wp.png", "./wp-schema-07-kaskade-zwei-waermepumpen.png", "./wp-schema-08-sole-wasser-waermepumpe.png", "./wp-schema-09-reversible-wp-heizen-kuehlen.png", "./wp-schema-10-monoblock-weiche-direkte-befuellung.png"];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(async c=>{
    await c.addAll(CORE);
    await Promise.allSettled(IMAGES.map(u=>c.add(u)));
  }));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request,{cache:'no-store'}).then(resp=>{
      if(resp && resp.ok){
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(event.request,copy));
      }
      return resp;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html')))
  );
});
