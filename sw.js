"use strict";

// Bei jeder Änderung an den Dateien hochzählen. Der neue Name legt einen neuen
// Cache an, und beim activate fliegen alle Caches mit anderem Namen raus.
var VERSION = "trinkwecker-v1";

// Alles, was die App zum Starten braucht. Die beiden Rechtsseiten sind dabei,
// damit auch die Links aus der Fußzeile offline funktionieren.
var DATEIEN = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./impressum.html",
  "./datenschutz.html"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION)
      .then(function (cache) { return cache.addAll(DATEIEN); })
      // Nicht auf geschlossene Tabs warten: die neue Fassung übernimmt sofort.
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (namen) {
        return Promise.all(namen.map(function (name) {
          return name === VERSION ? null : caches.delete(name);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var anfrage = e.request;
  if (anfrage.method !== "GET") return;
  // Fremde Server gehen den Service Worker nichts an.
  if (new URL(anfrage.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.match(anfrage, { ignoreSearch: true }).then(function (treffer) {
      if (treffer) return treffer; // Cache zuerst.

      return fetch(anfrage).then(function (antwort) {
        // Was aus dem eigenen Ordner nachgeladen wird, wandert in denselben
        // versionierten Cache und ist beim nächsten Mal offline verfügbar.
        if (antwort && antwort.ok && antwort.type === "basic") {
          var kopie = antwort.clone();
          caches.open(VERSION).then(function (cache) { cache.put(anfrage, kopie); });
        }
        return antwort;
      }).catch(function () {
        // Offline und nichts im Cache: bei Seitenaufrufen wenigstens die App zeigen.
        if (anfrage.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});
