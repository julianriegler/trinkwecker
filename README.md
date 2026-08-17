# Trinkwecker

Eine winzige Web-App, die daran erinnert, genug Wasser zu trinken. Der Plus-Button
zählt getrunkene Gläser hoch, das Tagesziel liegt bei 8 Gläsern, ein Fortschrittsbalken
zeigt den Stand, Erinnerungen melden sich per Web-Notification, und darunter zeigt
eine Wochenstatistik die letzten sieben Tage. Alles bleibt im localStorage des Browsers.

Die App steckt vollständig in `index.html`, CSS und JavaScript sind eingebettet.
Dazu kommen die beiden Rechtsseiten `impressum.html` und `datenschutz.html`, jede
ebenfalls für sich allein lauffähig, sowie `manifest.webmanifest`, `sw.js` und die
beiden Icons für die Installation. Kein Framework, kein npm, keine Installation,
keine Build-Schritte.

```
.github/workflows/
  pages.yml           Veröffentlichung auf GitHub Pages
index.html            App, CSS und JavaScript eingebettet
impressum.html        Impressum
datenschutz.html      Datenschutzerklärung
manifest.webmanifest  Angaben für die Installation
sw.js                 Service Worker, Cache-First mit Version
icon.svg              Quelle des Tropfen-Motivs
icon-192.png          daraus erzeugt, auch Apple-Touch-Icon
icon-512.png          daraus erzeugt
```

## Starten

Am besten über einen kleinen lokalen Server, denn Service Worker und Installation
brauchen http (Python ist auf macOS vorhanden, es wird nichts installiert):

```
python3 -m http.server 8000
```

Dann `http://localhost:8000` aufrufen.

Zum schnellen Hineinschauen genügt auch die Datei selbst:

```
open index.html
```

Zähler, Erinnerungen und Wochenansicht funktionieren dann ebenfalls, nur Installation
und Offline-Betrieb nicht, und manche Browser blockieren bei direkt geöffneten Dateien
den localStorage.

## Bedienung

- **Großer Plus-Button:** ein Glas dazu. Zählt auch über das Tagesziel hinaus weiter.
- **Ein Glas zurück:** korrigiert einen Fehlklick, bei Stand 0 deaktiviert.
- **Tag zurücksetzen:** setzt den Zähler nach Rückfrage auf 0.
- Der Fortschrittsbalken und die acht Glas-Symbole füllen sich mit, der Text unten
  nennt die noch offenen Gläser.
- **Einstellungen:** Tagesziel, Glasgröße und die Erinnerungen.
- Unter der Karte liegen die **Wochenstatistik** und der **Gesundheitshinweis**.

## Installieren und offline nutzen

Der Trinkwecker ist eine Progressive Web App. Über einen Webserver aufgerufen,
bietet Chrome ihn zur Installation an, auf dem iPhone geht es über „Zum Home-Bildschirm“
in Safari. Installiert startet er ohne Browserleiste (`display: standalone`) mit dem
Tropfen als Symbol.

`sw.js` legt beim ersten Aufruf einen Cache an und bedient danach **Cache-First**:
Startseite, Manifest, beide Icons und die beiden Rechtsseiten kommen aus dem Cache,
alles Weitere aus dem eigenen Ordner wandert beim ersten Laden mit hinein. Ohne Netz
startet die App vollständig, denn der Zähler lag ohnehin nur im Browser.

**Neue Fassung ausliefern:** In `sw.js` die Zeile `var VERSION = "trinkwecker-v1"`
hochzählen. Der neue Name legt einen frischen Cache an, beim `activate` fliegen alle
Caches mit anderem Namen raus, `skipWaiting` und `clients.claim` lassen die neue
Fassung sofort übernehmen, und die Seite lädt sich einmal selbst neu. Ein Reload
genügt also. Ohne hochgezählte Version bleibt der alte Stand im Cache.

Die Icons entstehen aus `icon.svg`. Wer das Motiv ändert, rendert die beiden PNGs neu,
etwa indem er die SVG in der passenden Größe im Browser öffnet und als PNG sichert.

## Gesundheitshinweis und Einwilligung

Unter der Wochenkarte steht ein kurzer Gesundheitshinweis: Der Trinkwecker zählt
Gläser und ersetzt keine medizinische Beratung, die acht Gläser sind nur ein
Richtwert, und bei Nieren-, Herz- oder anderen Erkrankungen gehört die Trinkmenge
ärztlich abgestimmt. Die App verspricht bewusst keine Wirkung, nennt keine Diagnose
und trifft keine Aussage über den Gesundheitszustand, damit die Vorgaben der Stores
für Gesundheits-Apps eingehalten sind.

Direkt über dem Schalter für die Erinnerungen, also unmittelbar vor der Abfrage der
Berechtigung, erklärt ein Absatz, wofür die Erlaubnis genutzt wird und dass sie
jederzeit im Browser widerrufbar ist. Der Schalter verweist per `aria-describedby`
auf diesen Text, damit auch Screenreader ihn vor der Abfrage vorlesen.

## Erinnerungen

In den Einstellungen gibt es den Schalter **Erinnerungen an**, ein Intervall
(60, 90 oder 120 Minuten) und ein Zeitfenster **von** und **bis**, standardmäßig
8 bis 20 Uhr. Ist der Schalter an, meldet sich der Browser im gewählten Takt mit
einer Web-Notification.

- Nach der Berechtigung fragt die App **ausschließlich beim Klick auf den Schalter**,
  nie beim Laden der Seite.
- Die Meldungen hängen an einer setTimeout-Kette: jede Meldung plant die nächste.
- **Still bleibt es**, wenn das Tagesziel schon erreicht ist oder das Zeitfenster
  gerade zu ist. Fällt der nächste Termin aus dem Fenster, rutscht er auf dessen
  nächste Öffnung.
- Der Schalter behält seinen Zustand über einen Reload. Auch der nächste Termin
  wird gespeichert, damit häufiges Neuladen die Kette nicht endlos verschiebt.
- Sind Notifications **nicht verfügbar oder blockiert** (etwa Safari auf dem iPhone
  außerhalb einer installierten App, oder eine abgelehnte Nachfrage), springt der
  Schalter zurück auf aus und die Statuszeile bekommt einen kurzen Hinweis. Es gibt
  keine Fehlermeldung, der Zähler läuft normal weiter.

Der Tab muss dafür geöffnet bleiben: ohne Service Worker gibt es keine Meldungen
bei geschlossenem Browser. Im Hintergrund drosseln Browser Timer, eine Erinnerung
kann daher ein paar Minuten später kommen.

## Wochenstatistik

Unter der Karte zeigt eine Sieben-Tage-Ansicht die laufende Woche von **Mo bis So**
als reine CSS-Balken, dazu die gestrichelte Zielmarke und ein Satz wie
*4 von 7 Tagen Ziel erreicht*.

- Ein Balken pro Tag, Höhe nach getrunkenen Gläsern. Die Skala richtet sich nach dem
  höheren Wert aus Tagesziel und bestem Tag der Woche, ein Tag über dem Ziel ragt
  also sichtbar über die gestrichelte Linie.
- Tage **ohne Eintrag** bleiben ein leerer Balken, ebenso die noch kommenden Tage
  der Woche.
- Tage ab dem Tagesziel sind mintgrün, der heutige Tag ist hervorgehoben.
- Verglichen wird immer mit dem **aktuellen** Tagesziel. Wer das Ziel ändert,
  bewertet damit auch die vergangenen Tage neu.

## Wie der Stand gespeichert wird

Unter dem Schlüssel `trinkwecker` liegt ein kleines JSON-Objekt im localStorage:

```json
{
  "datum": "2026-08-15",
  "glaeser": 4,
  "ziel": 8,
  "mlProGlas": 250,
  "erinnerungAn": true,
  "intervall": 60,
  "fensterVon": 8,
  "fensterBis": 20,
  "naechste": 1786950000000
}
```

Das Datum ist das lokale Kalenderdatum. Passt es nicht zum heutigen Tag, startet der
Zähler bei 0, der Tag beginnt also zu Mitternacht neu. Ein Tab, der über Mitternacht
offen bleibt, merkt das beim nächsten Aktivieren. Änderungen in einem anderen Tab
werden übernommen.

Der Verlauf steht getrennt davon unter dem Schlüssel `trinkwecker_verlauf`, als
Objekt von ISO-Datum auf die Zahl der Gläser:

```json
{ "2026-08-17": 8, "2026-08-18": 3, "2026-08-20": 5 }
```

Bei jeder Änderung des Zählers wird der heutige Wert hineingeschrieben. Beim Start
fliegen Einträge raus, die älter als 60 Tage sind, ebenso alles, was kein gültiges
Datum oder keine brauchbare Zahl ist.

Ist localStorage nicht verfügbar, etwa im privaten Modus, läuft die App weiter und
weist unten darauf hin, dass nichts gemerkt wird. Die Wochenansicht zeigt dann nur
den heutigen Tag.

## Impressum und Datenschutz

Unter der Wochenkarte steht eine dezente Fußzeile mit den Links zu `impressum.html`
und `datenschutz.html`. Beide Seiten nutzen dieselben CSS-Variablen, dieselbe schmale
Karte und führen mit einem Zurück-Link wieder in die App. Untereinander sind sie
ebenfalls verlinkt.

Das Impressum deckt § 5 ECG und § 25 Mediengesetz für Österreich sowie § 5 DDG für
Deutschland ab. Die Datenschutzerklärung erklärt in einfacher Sprache, dass alle
Trinkdaten im Browser bleiben, was der Hoster in seinen Logdateien sieht, wie die
Benachrichtigungsberechtigung funktioniert und welche Rechte nach DSGVO bestehen.

**Vor der Veröffentlichung ausfüllen.** Beide Seiten enthalten Platzhalter, die im
Text grün gestrichelt umrandet und in eckige Klammern gesetzt sind, im Quelltext als
`<span class="platzhalter">`. Zu ersetzen sind unter anderem Name, Anschrift,
E-Mail-Adresse, gegebenenfalls Firmenbuch- oder Handelsregisternummer, der Hoster
samt Speicherdauer der Logdateien und das Datum unter der Datenschutzerklärung.
Abschnitte, die nur für Unternehmen gelten, sind als solche gekennzeichnet und
können bei einem privaten Angebot entfallen.

Die Texte sind eine sorgfältig gebaute Vorlage und keine Rechtsberatung. Wer
gewerblich auftritt, sollte sie vor dem Livegang prüfen lassen.

## Deploy

Es gibt **noch keine Deploy-URL**, weil das Projekt bisher in keinem Repository
liegt. Der Workflow dafür ist aber fertig.

### GitHub Pages

`.github/workflows/pages.yml` veröffentlicht bei jedem Push auf `main` das
Wurzelverzeichnis, so wie es ist: `actions/checkout`, `actions/configure-pages`,
`actions/upload-pages-artifact` mit `path: .` und `actions/deploy-pages`.
**Kein Build, kein npm, keine Abhängigkeiten**, denn es gibt nichts zu übersetzen.
Die Ordner `.git` und `.github` lässt die Upload-Action von sich aus weg.

Einmalig nötig:

1. Repository anlegen und den Ordner hineinschieben:

   ```
   git init -b main
   git add .
   git commit -m "Trinkwecker"
   git remote add origin git@github.com:BENUTZERNAME/trinkwecker.git
   git push -u origin main
   ```

2. Im Repository unter **Settings, Pages** bei **Source** den Eintrag
   **GitHub Actions** wählen. Ohne diesen Schalter bricht `deploy-pages` mit einer
   Fehlermeldung ab. Der Zweig muss dort nicht eingestellt werden, das erledigt
   der Workflow.

3. Der erste Lauf startet mit dem nächsten Push, von Hand geht er über den Reiter
   **Actions**, Workflow **GitHub Pages**, **Run workflow**.

Die Seite liegt danach unter:

```
https://BENUTZERNAME.github.io/trinkwecker/
```

Heißt das Repository `BENUTZERNAME.github.io`, entfällt der Unterordner und die
Adresse ist `https://BENUTZERNAME.github.io/`. Beides funktioniert: alle Pfade in
der App sind relativ, Service Worker und Manifest richten sich nach dem Ordner, in
dem sie liegen. Die genaue Adresse steht nach dem Lauf auch in der Zusammenfassung
der Action und unter Settings, Pages.

Zwei Dinge nach einem Deploy:

- Bei Änderungen die Zeile `var VERSION` in `sw.js` hochzählen, sonst bleibt bei
  Besuchern die alte Fassung im Cache.
- Die Platzhalter in Impressum und Datenschutz vorher ausfüllen, siehe oben.

### Alternative: Cloudflare Pages

Wer lieber ein eigenes Netz mit Standorten in Europa möchte oder eine eigene Domain
schnell aufschalten will, nimmt Cloudflare Pages. Auch dort ist kein Build nötig:

1. Im Cloudflare-Dashboard **Workers & Pages**, **Create**, **Pages**, dann
   **Connect to Git** und das Repository auswählen.
2. Als Framework-Voreinstellung **None** wählen, das **Build-Kommando leer lassen**
   und als **Build output directory** einen Punkt (`.`) eintragen, also das
   Wurzelverzeichnis.
3. **Save and Deploy**. Jeder Push auf `main` löst danach eine neue Veröffentlichung
   aus, jeder andere Zweig bekommt eine Vorschau-Adresse.

Die Seite liegt dann unter `https://PROJEKTNAME.pages.dev/`, ohne Unterordner. Eine
eigene Domain lässt sich unter **Custom domains** hinzufügen. Ohne Git geht es auch
per Drag and Drop des Ordners im Dashboard, dann allerdings ohne automatische
Aktualisierung.

Beide Wege liefern die Seite über https aus, was für Service Worker und Installation
Voraussetzung ist.

## Getestet

Geprüft mit echtem Chrome über playwright-core (die Testumgebung liegt außerhalb
des Projekts, hier bleibt alles npm-frei). Abgedeckt: keine Nachfrage beim Laden,
genau eine Nachfrage beim Klick, freundlicher Hinweis statt Fehler bei fehlender
Erlaubnis, mit testweise auf eine Minute gesetztem Intervall genau eine Meldung,
Schalter und Intervall überleben einen Reload ohne zusätzliche Meldung, keine
Meldung außerhalb des Zeitfensters und keine mehr bei erreichtem Tagesziel.

Für die Wochenstatistik wurde die Browser-Uhr auf einen festen Donnerstag gestellt
und der Verlauf mit Testeinträgen für die Vortage gefüllt. Geprüft: Balkenhöhen und
Zielmarke, Lücke ohne Eintrag als leerer Balken, Kürzel Mo bis So, Hervorhebung des
heutigen Tages, der Zähltext, das Schreiben bei jeder Änderung, das Löschen von
Einträgen älter als 60 Tage (ein genau 60 Tage alter bleibt) sowie unbrauchbare
Schlüssel und Werte.

Gesundheitshinweis und Einwilligungstext wurden auf einem 360 Pixel breiten Viewport
vermessen: kein waagrechtes Scrollen, nichts ragt aus dem Sichtfeld, kein Text wird
abgeschnitten, keine Schrift unter 12,5 Pixel, Zeilenabstand mindestens das
1,25-fache der Schriftgröße und rund 32 Zeichen pro Zeile. Dabei fiel auf, dass die
Einstellungszeilen bei dieser Breite über den Rand liefen: sie brechen jetzt unter
420 Pixel Breite um, und einige Kleintexte wurden von 12 auf knapp 13 Pixel
vergrößert. Zusätzlich prüft der Testlauf, dass die Einwilligung im Dokument und
optisch vor dem Schalter steht und dass im Seitentext keine Heilversprechen stehen.

Der Pages-Workflow wurde mit einem YAML-Parser eingelesen: gültige Struktur, keine
Tabulatoren, LF als Zeilenende, Einrückung durchgehend in Zweierschritten, und die
vier erwarteten Schritte in der richtigen Reihenfolge. Zusätzlich wurde die App aus
einem Unterordner heraus ausgeliefert, so wie GitHub Pages es tut: der Service Worker
bekommt den Unterordner als Scope, das Manifest wird gefunden, und die Seite lädt dort
auch offline.

Die PWA wurde in Chrome geprüft: Manifest ohne Parserfehler (über das DevTools-Protokoll
abgefragt), beide Icons sind echte PNGs in 192 und 512, der Service Worker übernimmt die
Steuerung, im Cache liegen alle Startdateien unter einem versionierten Namen. Danach
Offline geschaltet, wie mit dem Schalter in den Entwicklertools: die Seite lädt neu,
Zähler, Wochenansicht und Gesundheitshinweis sind da, Zählen funktioniert weiter, und
auch `start_url` und das Impressum kommen offline. Der Versionswechsel wurde an einer
Kopie durchgespielt: Text geändert, Version hochgezählt, ein Reload, danach steht die
neue Fassung auf der Seite und nur noch der neue Cache existiert.

Für die Rechtsseiten wurde jeder Link angeklickt und in beide Richtungen verfolgt,
außerdem geprüft: alle Ziele antworten mit 200, kein Platzhalter steht unmarkiert im
Text, keine vergessenen Beispielangaben, gleiche CSS-Variablen wie auf der Startseite
und keine Ladefehler. Beim Aufräumen des letzten 404 aus dem Serverlog haben alle
drei Seiten ein kleines Favicon als Data-URI bekommen.

## Stand

Der genannte Auftrag ist umgesetzt. Offen und bewusst nicht enthalten: die
Platzhalter in Impressum und Datenschutz, die nur der Betreiber ausfüllen kann,
Erinnerungen bei geschlossener App über Web-Push (der Service Worker ist da, aber er
verschickt nichts), feste Uhrzeiten statt eines Intervalls, ein pro Tag mitgeschriebenes
Ziel und ein Blick auf frühere Wochen (gespeichert sind die Daten dafür bereits).
