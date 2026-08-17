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
- **+ ½ Glas** und **+ Flasche 0,5 l:** ein halbes Glas beziehungsweise 500 ml.
- **Letzte Zugabe zurück:** nimmt genau die zuletzt gebuchte Menge wieder heraus.
- **Tag zurücksetzen:** setzt den Zähler nach Rückfrage auf 0.
- Unter dem Zähler steht die getrunkene Menge in Litern mit einer Nachkommastelle.
- Der Fortschrittsbalken und die Glas-Symbole füllen sich mit, ein angebrochenes Glas
  wird halb gefüllt gezeigt.
- **Einstellungen:** Tagesziel, Glasgröße, Tag und Woche, Darstellung, Erinnerungen und deine Daten.
- Unter der Karte liegen die **Wochenstatistik** mit Serie und Teilen-Knopf sowie
  der **Gesundheitshinweis**.
- Beim ersten Start führt eine **Willkommenskarte** in drei Schritten durch das Nötigste.

## Installieren und offline nutzen

Der Trinkwecker ist eine Progressive Web App. Über einen Webserver aufgerufen,
bietet Chrome ihn zur Installation an, auf dem iPhone geht es über „Zum Home-Bildschirm“
in Safari. Installiert startet er ohne Browserleiste (`display: standalone`) mit dem
Tropfen als Symbol.

`sw.js` legt beim ersten Aufruf einen Cache an und bedient danach **Cache-First**:
Startseite, Manifest, beide Icons und die beiden Rechtsseiten kommen aus dem Cache,
alles Weitere aus dem eigenen Ordner wandert beim ersten Laden mit hinein. Ohne Netz
startet die App vollständig, denn der Zähler lag ohnehin nur im Browser.

**Neue Fassung ausliefern:** In `sw.js` die Zeile `var VERSION`
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

## Unterstützen

In der Fußzeile steht neben Impressum und Datenschutz ein zurückhaltender Link
**Unterstützen**. Die Adresse dahinter ist ein **Platzhalter** und steht als klar
markierte Konstante am Anfang des Skripts in `index.html`:

```js
var SPENDEN_URL = "https://example.org/trinkwecker-unterstuetzen";
```

Dort die eigene Spendenseite eintragen, etwa bei Ko-fi, Liberapay, PayPal oder einem
Verein. Ein **leerer Wert blendet den Link samt Trennzeichen aus**, wer nichts
sammeln will, ändert also nur diese eine Zeile.

Es gibt keine Bezahlschranke: die App ist vollständig nutzbar, der Link fragt nur.

**Datenschutz:** Von der Spendenseite ist hier nichts eingebunden, kein Skript, kein
Bild, kein Zählpixel, kein Rahmen. Solange niemand klickt, entsteht keine Verbindung
dorthin. Der Link trägt `target="_blank"` und `rel="noopener noreferrer"`, gibt also
weder die Herkunftsseite noch Zugriff auf das eigene Fenster weiter. Die
Datenschutzerklärung sagt das in einem eigenen Abschnitt und weist darauf hin, dass
ab dem Klick die Bestimmungen des Anbieters gelten. Auch dort steht der Name des
Anbieters als auszufüllender Platzhalter.

## Daten mitnehmen und löschen

Im Einstellungsbereich unter **Deine Daten** stehen drei Aktionen:

- **Daten exportieren** legt über einen Blob und eine Object-URL die Datei
  `trinkwecker-export.json` an. Sie enthält Stand, Einstellungen und Verlauf und
  bleibt auf dem Gerät, es geht nichts an einen Server.
- **Daten importieren** öffnet ein verstecktes Dateifeld, liest die Datei und
  übernimmt sie nach Prüfung. Erwartet wird `"app": "trinkwecker"`; Zahlen werden
  in ihre Grenzen gezogen, unbrauchbare Verlaufseinträge fallen weg, und ein
  Zählerstand von einem anderen Tag gilt heute nicht mehr.
- **Alle Daten löschen** entfernt nach Rückfrage jeden Schlüssel, der mit
  `trinkwecker` beginnt, stoppt laufende Erinnerungen und setzt die Ansicht auf
  die Standardwerte zurück.

Kaputte, leere oder fremde Dateien führen zu einem verständlichen Satz unter den
Knöpfen, nie zu einer Ausnahme, und der vorhandene Stand bleibt dabei unangetastet.

Aufbau der Exportdatei:

```json
{
  "app": "trinkwecker",
  "version": 2,
  "erstellt": "2026-08-17T09:12:00.000Z",
  "stand": { "datum": "2026-08-17", "ml": 1200, "zugaben": [300, 300, 300, 300] },
  "einstellungen": { "ziel": 10, "mlProGlas": 300, "thema": "hell",
                     "tagesgrenze": 4, "wochenstart": "mo",
                     "erinnerungAn": false, "intervall": 90,
                     "fensterVon": 7, "fensterBis": 21 },
  "verlauf": { "2026-08-16": 12 }
}
```

## Hell und dunkel

Die Farben liegen als CSS-Variablen in zwei Sätzen vor und werden über das Attribut
`data-theme` am `html`-Element gesteuert:

- `auto` (Standard) folgt der Systemeinstellung über `prefers-color-scheme`.
- `hell` und `dunkel` setzen sich darüber hinweg.

In den Einstellungen steht unter **Darstellung** ein Dreifach-Umschalter aus
Auto, Hell und Dunkel. Es sind echte Radiofelder, die Pfeiltasten funktionieren also
wie gewohnt. Die Wahl liegt im bestehenden Datensatz unter `thema` und übersteht
einen Reload. Ein kleines Skript im Dokumentkopf setzt das Attribut, bevor
gezeichnet wird, damit bei heller Wahl nichts dunkel aufblitzt, und schreibt die
Farbe der Browserleiste aus der Variablen `--bg` in die `theme-color`-Metaangabe.
Wechselt das Gerät bei Auto die Seite, folgen die Farben über CSS von selbst, die
Leistenfarbe zieht ein Listener nach.

Zum Kontrast: Alle Texttöne halten mindestens 4,5 zu 1 gegen ihren Untergrund. Mint
gibt es deshalb in zwei Rollen, `--mint` für Flächen und `--mint-text` für Schrift,
denn das helle Grün wäre auf Weiß nicht lesbar. Wo vorher `opacity` einen Text
aufgehellt hat, steht jetzt die eigene Farbe `--text-schwach`, damit sich der
Kontrast überhaupt messen lässt. Impressum und Datenschutz nutzen dieselben Sätze
und dasselbe Kopfskript, sie wechseln also mit.

## Beim ersten Start

Beim allerersten Aufruf öffnet sich eine Willkommenskarte, die in drei Schritten
durch das Nötigste führt:

1. **Dein Tagesziel:** Gläser pro Tag einstellen, voreingestellt sind acht. Die
   Änderung greift sofort, die Karte zeigt die Menge in Millilitern dazu.
2. **Erinnerungen:** ein Knopf schaltet sie ein, die Erlaubnis wird auch hier nur
   direkt aus dem Klick heraus erfragt. Überspringen ist ausdrücklich vorgesehen.
3. **Auf den Homescreen:** der Hinweis richtet sich nach dem Gerät. Auf iPhone und
   iPad steht dort der Weg über Teilen und „Zum Home-Bildschirm“, sonst der Weg über
   das Browsermenü. Bietet der Browser die Installation selbst an, erscheint ein
   Knopf dafür. Läuft der Trinkwecker bereits als App, sagt die Karte das.

Dass die Karte gesehen wurde, steht unter dem Schlüssel `trinkwecker_onboarding`
im localStorage. Danach erscheint sie nicht mehr. Erneut ansehen lässt sie sich über
**Einstellungen, Kurze Einführung erneut ansehen**. Wer den Schlüssel im Browser
löscht, bekommt den Ablauf beim nächsten Laden wieder.

Zur Bedienung: Die Karte ist ein `dialog` im modalen Zustand. Tab bleibt darin
gefangen, Escape schließt sie, beim Schritt-Wechsel wandert der Fokus auf die neue
Überschrift, damit Vorlesehilfen sie ansagen, und beim Schließen kehrt er dorthin
zurück, wo er vorher war. Jedes Schließen zählt als gesehen, auch das über Escape
oder das Kreuz.

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

## Tagesbeginn und Wochenstart

Unter **Tag und Woche** stehen zwei Einstellungen:

- **Tag beginnt um** (0 bis 6 Uhr, Standard 0): Bis zu dieser Stunde zählt alles noch
  zum Vortag. Wer um zwei Uhr nachts trinkt und die Grenze auf 4 Uhr stellt, bucht
  also auf gestern. Technisch wird die Grenze von der aktuellen Zeit abgezogen, bevor
  das lokale Kalenderdatum gebildet wird. Alles, was mit Tagen rechnet, nutzt dieses
  Datum: der gespeicherte Stand, der Verlauf, die Wochenansicht, die Serie und das
  Aufräumen alter Einträge. Auch die Prüfung beim Aktivieren des Tabs und der Abgleich
  über das `storage`-Ereignis gehen darüber, ein Tageswechsel wird also bemerkt,
  während die Seite offen liegt.
- **Woche beginnt am** (Montag oder Sonntag): ordnet die Wochenstatistik. Die
  Beschriftungen richten sich nach dem tatsächlichen Wochentag jeder Säule, sind also
  in beiden Fällen korrekt.

Beim Wechsel der Grenze wird der laufende Stand zuerst unter dem bisherigen Tag
festgeschrieben und erst dann neu bewertet, damit nichts in den neuen Tag mitwandert.
Den Tageswert führt ohnehin der Verlauf: passt das Datum im Datensatz nicht zum
aktuellen Tag, kommt der Wert von dort.

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

### Serie und Teilen

Unter der Statistik steht dezent die Serie erreichter Tagesziele, dazu ein
**Teilen**-Knopf.

- Die **laufende Serie** endet heute. Ist das Ziel heute noch offen, zählt sie ab
  gestern weiter, damit sie nicht schon am Morgen als gerissen dasteht.
- Die **längste Serie** ist der längste zusammenhängende Lauf im gespeicherten
  Verlauf, also innerhalb der letzten 60 Tage.
- Der Block erscheint erst ab **zwei bekannten Tagen** und nur, wenn es etwas zu
  zeigen gibt, also eine Serie von mindestens zwei Tagen. Ein „0 Tage am Stück“
  taucht nie auf. Ist die Serie gerissen, steht dort nur noch der Bestwert.
- **Teilen** schickt über `navigator.share` einen Satz wie *5 Tage am Stück
  Trinkziel erreicht.* samt Adresse der App. Bricht jemand den Teilen-Dialog ab,
  passiert nichts weiter. Fehlt die Web Share API oder scheitert sie, landet der
  Text samt Link in der Zwischenablage, und darunter erscheint für ein paar
  Sekunden eine Bestätigung.

## Wie der Stand gespeichert wird

**Gezählt wird intern in Millilitern**, die Gläserzahl ist nur die Anzeige und ergibt
sich aus der eingestellten Glasgröße. So lassen sich halbe Gläser und Flaschen
verlustfrei mischen.

Unter dem Schlüssel `trinkwecker` liegt ein kleines JSON-Objekt im localStorage:

```json
{
  "version": 2,
  "datum": "2026-08-15",
  "tagesgrenze": 0,
  "wochenstart": "mo",
  "ml": 1125,
  "zugaben": [250, 500, 250, 125],
  "ziel": 8,
  "mlProGlas": 250,
  "thema": "auto",
  "erinnerungAn": true,
  "intervall": 60,
  "fensterVon": 8,
  "fensterBis": 20,
  "naechste": 1786950000000
}
```

`zugaben` listet die einzelnen Buchungen des Tages in der Reihenfolge, in der sie
eingetragen wurden. Daraus weiß **Letzte Zugabe zurück**, wie viel es herausnehmen
muss.

**Umstieg von Fassung 1:** Ältere Stände haben statt `ml` das Feld `glaeser` und keine
`version`. Beim ersten Start rechnet die App sie mit der dort gespeicherten Glasgröße
in Milliliter um, den Verlauf gleich mit, und schreibt das Ergebnis als Fassung 2
zurück. Die Anzeige bleibt dabei auf denselben Werten stehen. Alte Exportdateien
(`version` fehlt oder 1, `stand.glaeser`) liest der Import genauso.

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

Der Verlauf unter `trinkwecker_verlauf` hält pro Tag die Menge in Millilitern.

Unter `trinkwecker_onboarding` steht nur, dass die Willkommenskarte gesehen wurde:

```json
{ "gesehen": true, "datum": "2026-08-17" }
```

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

Das Repository liegt auf `github.com/julianriegler/trinkwecker`. Sobald der erste
Push auf `main` durch ist und der Pages-Schalter steht, ist die App erreichbar unter:

**https://julianriegler.github.io/trinkwecker/**

### GitHub Pages

`.github/workflows/pages.yml` veröffentlicht bei jedem Push auf `main` das
Wurzelverzeichnis, so wie es ist: `actions/checkout`, `actions/configure-pages`,
`actions/upload-pages-artifact` mit `path: .` und `actions/deploy-pages`.
**Kein Build, kein npm, keine Abhängigkeiten**, denn es gibt nichts zu übersetzen.
Die Ordner `.git` und `.github` lässt die Upload-Action von sich aus weg.

Einmalig nötig:

1. Stand hochschieben:

   ```
   git add .
   git commit -m "Onboarding"
   git push -u origin main
   ```

2. Im Repository unter **Settings, Pages** bei **Source** den Eintrag
   **GitHub Actions** wählen. Ohne diesen Schalter bricht `deploy-pages` mit einer
   Fehlermeldung ab. Der Zweig muss dort nicht eingestellt werden, das erledigt
   der Workflow.

3. Der erste Lauf startet mit dem nächsten Push, von Hand geht er über den Reiter
   **Actions**, Workflow **GitHub Pages**, **Run workflow**.

Die Seite liegt danach unter `https://julianriegler.github.io/trinkwecker/`.

Hieße das Repository `julianriegler.github.io`, entfiele der Unterordner. Beides
funktioniert: alle Pfade in
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

Für den Spendenlink prüft ein eigener Durchgang, dass beim Laden der Startseite und
beider Rechtsseiten **keine einzige Anfrage an eine fremde Domain** geht: alles, was
nicht zum eigenen Server, zu `data:` oder `blob:` gehört, wird im Test hart geblockt
und gemeldet, geblockt wurde nichts. Dazu ein Blick in den Quelltext aller Dateien
auf iframe, object, embed, fremde Skripte und Stylesheets, absolute Quellen und
externe `url()` im CSS, sowie eine Liste aller absoluten Adressen. Der Klick öffnet
die Seite in einem neuen Tab, das neue Fenster kennt seinen Öffner nicht und bekommt
keinen Referrer, und eine leere Konstante blendet den Link aus.

Tagesgrenze und Wochenstart wurden mit vorgestellter Systemzeit geprüft: bei Grenze
4 Uhr und Uhrzeit 2 Uhr nachts gilt weiterhin der Vortag, der Stand bleibt stehen und
neue Zugaben landen auf dem Vortag, während dieselbe Uhrzeit ohne Grenze schon den
neuen Tag zeigt. Weiter geprüft: der Tageswechsel bei offener Seite (Uhr über die
Grenze stellen, Tab aktivieren), der Abgleich über das `storage`-Ereignis, das
Umstellen der Grenze im laufenden Betrieb in beide Richtungen samt Reload, sowie beim
Wochenstart die Reihenfolge der Kürzel, die Zeitspanne, welcher Tag in die Woche
fällt und die Beschriftung der Säulen.

Für den Umstieg auf Milliliter wurde die vorige Fassung aus dem letzten Commit
danebengestellt und beide mit demselben alten Speicher geladen: Zähler, Ziel,
Prozentwert, Balkenbreite, volle Glassymbole, alle sieben Wochenbalken und der
Wochentext stimmen in fünf Fällen überein (Standardglas, große Gläser, übertroffenes
Ziel, ohne Verlauf, Stand von gestern). Danach steht der Speicher auf Fassung 2, das
Feld `glaeser` ist weg, der Verlauf ist umgerechnet, und ein zweiter Aufruf verschiebt
nichts mehr. Ebenfalls geprüft: die Reihenfolge des Zugaben-Stapels, das Zurücknehmen
genau der letzten Menge, das Zurücknehmen bei migrierten Ständen ohne Stapel, die
Rundung eines halben Glases bei krummer Glasgröße und unbrauchbare alte Werte.

Der Weg Export, Löschen, Import wurde im Browser durchgespielt: Ausgangslage mit
Ziel 10, 300 ml, hellem Thema und vier Verlaufstagen, dann Export mit echtem
Download, dann Löschen und Prüfen, dass kein `trinkwecker`-Schlüssel übrig bleibt
und die Ansicht auf Standardwerte steht, dann Import derselben Datei. Danach
stimmen Zähler, Ziel, Glasgröße, Mengenangabe, Thema, Serie, alle sieben
Wochenbalken und der gespeicherte Datensatz wieder mit dem Ausgangszustand
überein, auch nach einem Reload. Sieben kaputte oder fremde Dateien (unlesbares
JSON, leer, Liste, null, fremde App, ohne Kennung, reiner Text) liefern jeweils
eine Meldung und lassen den Stand unberührt, und eine Datei mit richtiger Kennung
aber unsinnigen Werten wird zurechtgebogen statt übernommen. Ein abgebrochener
Löschdialog ändert nichts.

Für Hell und Dunkel wurde beides visuell begutachtet und gemessen: Auto folgt dem
System in beide Richtungen, Hell und Dunkel setzen sich darüber hinweg, die Wahl
übersteht den Reload, die Pfeiltasten bedienen den Umschalter, und die
`theme-color`-Metaangabe stimmt jeweils mit dem aktiven Hintergrund überein. Dazu
misst der Testlauf den Kontrast jedes sichtbaren Textes gegen seinen tatsächlichen
Untergrund, in beiden Modi und samt geöffneter Willkommenskarte: rund 60 Texte je
Durchgang, keiner unter 4,5 zu 1 (bzw. 3 zu 1 bei großer Schrift). Der schwächste
Wert liegt bei 4,64 zu 1. Text auf Mintflächen wird gesondert geprüft, dort sind es
mindestens 5,4 zu 1.

Serie und Teilen wurden mit von Hand gesetzten Verlaufsdaten und fixiertem Datum
geprüft: fünf Tage am Stück, eine Serie mit Lücke davor, ein heute noch offener Tag,
eine gerissene Serie, ein einzelner Tag und zwei Tage ohne Serie. Ebenso, dass ein
höheres Tagesziel die Serie schrumpfen lässt. Beide Teilen-Wege liefen im Browser:
mit `navigator.share` kommt genau ein Aufruf mit Titel, Satz und App-Link an, ein
Abbruch bleibt folgenlos, ein echter Fehler weicht auf die Zwischenablage aus, und
ohne Web Share API steht der Text samt Link tatsächlich in der Zwischenablage,
zurückgelesen über die Browserschnittstelle. Die Bestätigung blendet sich nach
sechs Sekunden wieder aus.

Die Willkommenskarte wurde durchgespielt: sie öffnet sich beim ersten Start, blättert
vor und zurück, das dort gewählte Ziel steht sofort in der App, Schließen speichert
den Schlüssel, nach einem Reload bleibt sie weg. Nach dem Löschen von
`trinkwecker_onboarding` startet der Ablauf erneut und ist danach wieder still.
Tastatur: vierzehnmal Tab bleibt in der Karte und läuft im Kreis, Shift und Tab
ebenso, Enter blättert, Escape schließt und merkt sich das, der Fokus kehrt zum
Einstellungsknopf zurück. Mit einer iPhone-Kennung erscheint der Weg über Teilen und
„Zum Home-Bildschirm“, und auf 360 Pixel Breite passt die Karte ohne Überstand und
ohne Schrift unter 12,5 Pixel.

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
