# OJ Gebrauchtwagen-Check – Testversion

Mobile-first Web-App für die geführte Besichtigung eines Gebrauchtwagens. Die Anwendung ist statisch und ohne Serverlogik umgesetzt. Sie ist vom Farbwirbel-Spiel und von der OJ-Website getrennt.

**Testversion. Die lokale Entwicklung erfolgte ohne Repository. Auf GF-Anweisung wird die getestete statische Testversion im separaten öffentlichen Repo `oj-gutachter/gebrauchtwagen-check` auf GitHub Pages bereitgestellt. Kein App-Store-Release und kein produktiver OJ-Schadenmelder.**

## Enthalten

- Vor der Checkliste große Antriebswahl mit Symbolen: Benziner, Diesel, Hybrid/Plug-in-Hybrid oder Elektro. Sie wird mit dem Check-Zustand lokal gespeichert; ein Antriebswechsel löscht keine Antworten.
- Benziner/Diesel: 8 Schritte mit 46 Prüfpunkten. Hybrid/Plug-in-Hybrid: 9 Schritte mit 52 Punkten (alle bisherigen Punkte plus sechs Hybrid-/Batterie-Punkte). Elektro: 9 Schritte mit 53 Punkten (41 passende Bestandspunkte plus zwölf Akku-/Hochvolt-Punkte).
- Bei Elektro entfallen genau Motoröl/Öldeckel, Riemen/Batterie/Steckverbindungen des Verbrenner-Motorraums, Motorstart/Leerlauf, Anfahren/Schalten/Kupplung sowie Motorleistung/Temperatur/Auspuffrauch. Kühlmittel, Flüssigkeitsspuren und vordere Unfallstruktur bleiben erhalten.
- Elektro enthält einen eigenen Schritt „Akku & Hochvolt“: SoH-Nachweis, Hersteller-Batteriegarantie laut Unterlagen (häufige 8 Jahre/160.000 km nur als Prüfbezug), Reichweite, Ladeanschluss/-kabel, AC-/DC-Probeladung, Unterboden/Akkugehäuse, Hochvolt-Warnungen, Wartung/Rückrufe/Software, Batteriemiete, Wärmepumpe/Batterieklimatisierung, 12-V-Batterie und Bremsenrost durch Rekuperation. Hybrid ergänzt sechs Punkte zu Hybridbatterie/Garantie, Betriebswechsel, Plug-in-Laden, elektrischer Reichweite, Warnungen und Unterboden.
- Deutlicher Sicherheitshinweis in beiden Blöcken: Hochvoltteile und orangefarbene Leitungen niemals selbst öffnen, berühren oder daran arbeiten; Arbeiten gehören in eine entsprechend qualifizierte Fachwerkstatt.
- Je Prüfpunkt: „In Ordnung“, „Auffällig“, „Unklar“.
- Kurze Fach- und Sicherheitshinweise, Fortschritt und Schritt-Navigation.
- Ampel-Auswertung und Kontakt-E-Mail-Entwurf nennen den gewählten Antrieb und zählen nur seine sichtbaren Punkte. Die Druck-/PDF-Ansicht enthält zusätzlich die vollständige angepasste Prüfpunktliste mit Bewertung.
- Lokale Kontaktansicht mit Telefon und E-Mail-Entwurf. Kein automatisches Senden und kein Online-Formular.
- Abgrenzung zum OJ Schadenmelder: Diese Anwendung betrifft ausschließlich den Gebrauchtwagenkauf, nicht die Unfall-Schadenmeldung.
- „Mein Auto – Erinnerungen“: Fahrzeugname/Kennzeichen optional, HU mit Monat und Jahr, Reifenwechsel Sommer/Winter, Inspektion nach Datum und/oder Kilometerstand. Bei Benziner/Diesel/Hybrid heißt der Termin „Inspektion / Ölwechsel“, bei Elektro nur „Inspektion“ – inklusive Kalenderdatei.
- Terminübersicht mit Tage- oder Kilometer-Countdown und beschrifteter Ampel: mehr als acht Wochen grün, bald gelb, überfällig rot. Beim HU-Monat zählt das Monatsende.
- „O bis O“ nur als frei änderbarer Vorschlag: Winterreifen 15. Oktober, Sommerreifen eine Woche nach dem tatsächlich berechneten Ostersonntag. Wetter und reale Bedingungen bleiben maßgeblich, kein starrer gesetzlicher Wechseltermin.
- HU-Hinweis: Pkw in der Regel alle 24 Monate, Neuwagen erstmals nach 36 Monaten. Maßgeblich bleiben Prüfbericht und Plakette (siehe ADAC HU/AU: https://www.adac.de/rund-ums-fahrzeug/reparatur-pflege-wartung/hu-und-au/hu-und-au/).
- Je Termin Download einer ganztägigen `.ics`-Kalenderdatei (RFC 5545, ohne BOM, `text/calendar`) mit zwei relativen VALARM: vier Wochen vorher (`-P27DT15H`) und am Vortag (`-PT15H`), jeweils 09:00 Uhr Ortszeit. Titel in der App-Sprache mit „· OJ Gebrauchtwagen-Check“. Der Import erfolgt erst manuell durch den Nutzer. Warnung: Bei der HU steht der Kalendertag für den Plakettenmonat, nicht für eine feste Werkstattbuchung.
- Besichtigungstermin (optional) auf der Startseite: Datum, Uhrzeit optional, Knopf „In Kalender eintragen“. Mit Uhrzeit 1 Stunde Termin und Erinnerungen 1 Tag und 2 Stunden vorher, ohne Uhrzeit ganztägig mit Erinnerung am Vortag 09:00 Uhr. Gespeichert im Check-Zustand unter `appointment`.
- „Sichern & Wiederherstellen“ (`#sicherung`, `backup.js`): Export als `OJ-Gebrauchtwagen-Check-Sicherung-JJJJ-MM-TT.json` (`format: oj-gebrauchtwagen-check-sicherung`, `version: 1`, Check + Erinnerungen). Teilen über die Web Share API mit Datei, sonst Download. Wiederherstellen prüft Format, Version und Aufbau, zeigt vorher, was passiert, und führt ohne Duplikate zusammen: Werte auf dem Gerät bleiben, Fehlendes wird ergänzt; nur ein anderer Check (anderer Startzeitpunkt) wird nach deutlichem Hinweis ersetzt. Ungültige Dateien ergeben eine freundliche Meldung ohne Datenänderung. Erreichbar über Fußzeile, Startseite, Auswertung (neben dem Druckprotokoll) und Erinnerungen.
- Browser-Benachrichtigungen/Push bewusst nicht eingebaut: ohne geöffnete App keine Hintergrunderinnerung. Spätere native App: lokale Notifications mit Capacitor, ohne Server oder Tracking; native iPhone-/Android-Integration separat testen.
- Moderne Hauptversion (seit GF-Entscheidung 06.11.2026): weiche Karten, rundes OJ-Logo, untere App-Leiste. Aussehen „Automatisch“, „Hell“ oder „Dunkel“. Automatisch folgt der Telefon-Einstellung; die Wahl wird nur lokal unter `oj-gebrauchtwagen-check.theme.v1` gespeichert. Das frühe Skript verhindert einen falschen Farbblitz vor dem ersten Aufbau und passt die Browser-Theme-Farbe an.
- Sechs Sprachen: Deutsch, English, Türkçe, العربية, Polski und Русский. Ohne gespeicherte Wahl wird eine unterstützte Browsersprache erkannt, sonst Deutsch. Die Wahl unter `oj-gebrauchtwagen-check.language.v1`, die bestehenden 46 Prüfpunkte sowie alle Antriebs-, Akku- und Hybridtexte, Auswertung, Kontakt-/E-Mail-Texte und drei `.ics`-Texte sind sprachspezifisch. Arabisch verwendet vollständiges RTL.
- Die fremdsprachigen Fassungen sind sorgfältig vorbereitete Übersetzungsentwürfe, aber keine muttersprachliche Schlussredaktion. Vor einem produktiven Release ist eine fachliche und muttersprachliche Kontrolle vorgesehen.
- Die frühere schlichte Root-Version liegt nur noch in der Git-Historie. `/neu/` leitet per Meta-Refresh auf die Hauptversion unter `/` um.
- Große Schrift (Haupttext mindestens 18px, Hilfetext mindestens 17px), mindestens 48px hohe Bedienelemente und beschriftete Status statt reiner Farbcodierung.
- Sichtbarer „Testversion“-Hinweis und `noindex, nofollow, noarchive` per Meta-Tag sowie Disallow in `robots.txt`. Das reduziert Suchmaschinen-Auffindbarkeit, macht den öffentlichen Link aber nicht privat.
- Rechtliche und sicherheitsbezogene Hinweise, keine Erfolgs- oder Unfallfreiheitsgarantie.

## Datenschutz und Offline-Nutzung

Einstellungen für Sprache und Aussehen bleiben ebenfalls ausschließlich lokal. Ihre Antworten werden unter `oj-gebrauchtwagen-check.v1` inklusive Antriebswahl, Fahrzeug-/Termindaten unter `oj-gebrauchtwagen-check.reminders.v1` im localStorage des jeweiligen Browsers gespeichert. Es gibt kein Konto, keine Werbung, kein Tracking, keine externen Schriften, Skripte oder API-Aufrufe. Der Service Worker speichert ausschließlich die eigenen statischen Anwendungsdateien für die Offline-Nutzung. Nach einer Änderung muss der Cache-Namen in `service-worker.js` angehoben werden.

Das Manifest ist auf `display: standalone` eingestellt; App-Symbole und Apple-Meta-Tags sind vorhanden. Alle Pfade sind relativ, damit der statische Ordner später mit Capacitor als iOS-/Android-Hülle verwendet werden kann. Für eine echte App-Veröffentlichung sind separates App-Konto, Datenschutz-/Store-Prüfung und die Freigabe des GF erforderlich.

## Lokal testen

```sh
node tests/serve.cjs
# Nur auf diesem Rechner: http://127.0.0.1:4179
```

Für einen späteren Smartphone-Test muss die Anwendung über HTTPS oder für localhost per HTTP ausgeliefert werden. Direktes Öffnen über `file://` ist für den Service Worker nicht geeignet.

```sh
npm install --prefix tests
node tests/browser-test.cjs
node tests/reminders-test.cjs
node tests/accessibility-test.cjs
node tests/drivetrain-test.cjs
```

Der Basistest erwartet Google Chrome unter `/usr/bin/google-chrome`. Er prüft den Ablauf in mobiler Ansicht 390 × 844 Pixel, Speicherung/Neuladen, Reset, rote und grüne Auswertung, Kontaktlinks, Offline-Neuladen, horizontales Layout bis 320 Pixel und Konsolenfehler. Die Testdateien sind nicht Teil der öffentlichen Auslieferung. Der separate Erinnerungs-Test deckt Eingabe, Speichern/Neuladen, Löschen, Ampel, Kontaktlinks und drei echte Kalender-Downloads ab. Der Bedienungstest prüft 390×844 und 320×740 Pixel, Mindestschrift und Tippflächen sowie wichtige Kontraste.

## Antriebs-Funktionsprüfung

06.11.2026: Neuer lokaler Test `tests/drivetrain-test.cjs` prüft alle vier Antriebe und Punktzahlen, Elektro-Filter, 12 Akku-/6 Hybrid-Punkte, Antwortpersistenz, Auswertung, Druck/PDF, Kontaktentwurf, Elektro-Erinnerungen, alle sechs Sprachen einschließlich RTL, mobile Breiten 390/320 Pixel und Offline mit Cache v12. Die drei geforderten Bilder liegen unter `screenshots/antrieb-auswahl.png`, `screenshots/antrieb-elektro-akku.png` und `screenshots/antrieb-auswertung-elektro.png` (jeweils 390 × 844 Pixel). Die fremdsprachigen Fachtexte bleiben Übersetzungsentwürfe und benötigen vor produktiver Veröffentlichung eine fachliche und muttersprachliche Schlussredaktion.

## Frühere Funktionsprüfung

06.11.2026, 21:31 Uhr MEZ bestanden: Alle sechs Sprachen durchliefen je 87 lokale Prüfungen in Chrome, darunter alle 46 Prüfpunkte, Auswertung, Kontakt-E-Mail-Entwürfe, Erinnerungen, Theme-/Sprachpersistenz, Offline und drei echte UTF-8-Kalender-Downloads. Spracherkennung enthielt `fr-FR → de`. Arabisch zeigt vollständiges RTL; zusätzliche Layoutprüfungen für Türkisch und Arabisch durchliefen Start, Prüfschritt, Kontakt, Erinnerungen, Formular und Rechtstexte in 390 und 320 Pixeln ohne horizontalen Überlauf oder sichtbare Bedienfläche unter 48 px.

Alle 18 Kalenderdateien wurden mit `icalendar` unabhängig eingelesen; physische Zeilen enthalten einschließlich Fortsetzungszeichen maximal 75 Bytes. 594 geprüfte sichtbare Textpaare erreichten mindestens 4,9058:1 Kontrast. Service Worker: `oj-gebrauchtwagen-check-v12` (löscht ältere Root- und neu-Caches). Berichte lokal unter `tests/artifacts/neu-i18n-report.json`, `calendar-i18n-parser-report.json` und `text-integrity-report.txt`.

Die fünf geprüften mobilen Abschlussbilder in 390 × 844 Pixel: `screenshots/neu-theme-light.png`, `neu-theme-dark.png`, `neu-lang-switch.png`, `neu-start-tr.png` und `neu-start-ar.png`. Keine muttersprachliche Schlussredaktion der fünf Fremdsprachen; vor einem produktiven Release fachliche Durchsicht durch Muttersprachler.

Am 06.11.2026 abends wurde die moderne Version auf Anweisung des GF zur Root-Hauptversion. Screenshot der Startseite: `screenshots/haupt-start.png` (lokal, nicht in Pages).

## Quellen von Kontaktdaten und Branding

Keine Kontaktdaten wurden neu erfunden oder ergänzt.

| Angabe | Verwendeter Wert | Lokale Quelle |
|---|---|---|
| Mobil | 0176 21468719 | `/workspace/oj-gutachter/website/raw/index.html`, Kontaktbereich und tel-Link; bestätigt durch `/workspace/oj-gutachter/stammdaten.md` |
| Festnetz | 0231 62855200 | `/workspace/oj-gutachter/website/raw/index.html`, Kontaktbereich und tel-Link |
| E-Mail | info@oj-gutachter.de | `/workspace/oj-gutachter/website/raw/index.html`, Kontaktbereich und mailto-Link; außerdem `/workspace/oj-gutachter/website/raw/page_impressum.html` |
| Name/Anschrift | Larry O. Johnson, Meißener Straße 62, 44139 Dortmund | `/workspace/oj-gutachter/stammdaten.md`, Impressum der vorhandenen Website |
| Website | www.oj-gutachter.de | `/workspace/oj-gutachter/stammdaten.md` |
| Weinrot/Anthrazit | #5D0C0D / vorhandene dunkle OJ-Farben | Meta-Theme-Color und CSS in `/workspace/oj-gutachter/website/raw/index.html` |
| Logo | OJ-Markenzeichen, nur proportional und in Rot/Weiß aufbereitet | `/workspace/oj-gutachter/marketing/oj-logo-original.png` |

In `stammdaten.md` stand die E-Mail noch als offen. Deshalb wurde die eindeutige Adresse aus dem Impressum und Kontaktbereich der vorhandenen OJ-Website übernommen.

## Ergebnis der lokalen Tests

06.11.2026, 19:24 Uhr MEZ:

- Bisheriger Ablauf, Auswertung, Kontaktlinks, lokale Speicherung, Reset und Offline-Nutzung erneut bestanden.
- Neue Eingabe und Erinnerungsübersicht persistieren in localStorage; Reset der Kauf-Checkliste beeinflusst die separaten Auto-Erinnerungen nicht.
- Keine Konsolenfehler oder JavaScript-Fehler, keine externen Netzwerk-Anfragen beim normalen Gebrauch.
- Drei echte UTF-8-.ics-Downloads getestet: CRLF, maximal 75 Bytes je physischer Zeile, ganztägiges Datum, VALARM 28 Tage vorher 08:00 Uhr. Zusätzlich mit `icalendar` eingelesen, deutsche Zeichen einschließlich „TÜV“ korrekt.
- Bedienprüfung bestanden: mindestens 17px Text, 48px Bedienelemente, getestete Textkontraste über 4,5:1, kein horizontales Scrollen bei 320px.
- Berichte: `tests/artifacts/test-report.json`, `tests/artifacts/reminders-test-report.json`, `tests/artifacts/accessibility-report.json`, `tests/artifacts/calendar-parser-report.json`.

Sieben aktualisierte Präsentationsbilder liegen unter `screenshots/`, darunter `05-erinnerungen.png`, `06-erinnerungen-uebersicht.png` und `07-erinnerungen-ampel.png`.

## Nicht veröffentlichte Logo-Alternativen

`logo-entwuerfe/` enthält drei 1024×1024-PNG-Alternativen aus dem vorhandenen OJ-Zeichen: Weinrot/Weiß, Weiß/Weinrot sowie weißer Kreis auf Weinrot. Dazu gibt es 128px-Vorschauen und `uebersicht.png`. Das tatsächliche App- und Kopfzeilenlogo wurde nicht verändert. Diese Entwürfe gehören nicht zur Pages-Auslieferung.

## Öffentlicher Testlink

Nach ausdrücklicher GF-Freigabe veröffentlicht: `https://oj-gutachter.github.io/gebrauchtwagen-check/`. Die moderne Version ist die Hauptversion unter diesem Link (Themes, sechs Sprachen, rundes Logo). `/neu/` leitet dorthin um. Weiterhin Testversion mit sichtbarem Badge und `noindex`. Keine Mails, keine App-Store-Einreichung.

## Marktcheck

Der Marktcheck vom 06.11.2026 mit acht geprüften Beispielen steht unter der lokalen Datei `marktcheck.md`. Links und sichtbare Preis-/Bewertungsangaben stammen von Anbieter- oder Store-Seiten; keine Bewertung wird für Angebote ohne sichtbare Bewertung behauptet.

Aktualisierter technischer Stand (Dokumentation und Live-Prüfung) ist nach dem ersten Pages-Commit lokal ergänzt; die eingesetzten Anwendungsdateien sind unverändert und live getestet.

## Native Hülle (nicht veröffentlicht)

Android- und iOS-Projekt liegen unter `android/` und `ios/`. Sie werden nicht in den App Store oder bei Google Play hochgeladen. Die statische Web-App auf GitHub Pages bleibt im Browser beim bisherigen Weg: `.ics`-Datei oder Google-Kalender. Der native Kalender, der Hinweis auf das Büro und die zusätzlichen Batteriefelder laufen nur, wenn Capacitor `isNativePlatform()` meldet.

Vorgeschlagene App-ID, vom Inhaber noch änderbar: `de.ojgutachter.gebrauchtwagencheck`. Anzeigename: OJ Gebrauchtwagen-Check. Startsymbol und Startbild verwenden das Weinrot-Monogramm aus `resources/icon-source.png`.

```sh
npm install
npm run cap:sync
cd android && ./gradlew assembleDebug
```

Die Debug-APK liegt danach unter `android/app/build/outputs/apk/debug/`. iOS braucht einen Mac mit Xcode: `npm run cap:sync`, dann `ios/App/App.xcodeproj` öffnen und im Simulator starten. Ohne Mac ist das iOS-Projekt vorbereitet, aber nicht gebaut und nicht im Simulator geprüft.

Im nativen Kalender schreibt „In Kalender eintragen“ den Termin einschließlich der bisherigen Erinnerungen direkt in den Gerätekalender. Die Systemabfrage erscheint erst beim ersten Tippen auf einen solchen Knopf. Bei Ablehnung oder Sperre gibt es einen Hinweis in der aktuellen Sprache, einen Weg in die Einstellungen und die Kalenderdatei zum Teilen oder Speichern.

Der dezente Hinweis „Unabhängiger Kfz-Sachverständiger in der Nähe“ steht nur bei HU- oder Inspektionserinnerungen, lässt sich ausblenden und bleibt ausgeblendet. Er beschreibt die unabhängige, neutrale Prüfung durch OJ Gutachter vor dem Kauf, bei Mängeln oder nach einem Unfall, mit Gebrauchtwagen-Check, Schadengutachten und Wertgutachten. Büro, Telefon, Website und Öffnungszeiten stammen aus der bestehenden App und von https://www.oj-gutachter.de. Die Entfernung nutzt nur den ungefähren Standort und nur nach Tippen auf „Entfernung anzeigen“. Die Kartensuche nach „Kfz-Sachverständiger“ öffnet die Karten-App, ohne den Standort zu speichern oder zu versenden.

Bei Hybrid und Elektro ergänzt der bestehende Schritt „Akku & Hochvolt“ beziehungsweise „Hybridantrieb & Batterie“ SoH, Zertifikatsdatum und Garantieangaben. Es gibt keine zusätzlichen Prüfpunkte und keine zweite Liste. Benziner und Diesel sehen das nicht. Die Werte bleiben lokal, erscheinen in Sicherung, Auswertung und Druck und fehlen im Browser.

Ein späterer Einmalkauf ist vorbereitet, aber aus: `PAYWALL_ENABLED` in `paywall-config.js` steht auf `false`. Solange das so bleibt, gibt es keinen Kaufknopf, kein „Pro“ und kein „Käufe wiederherstellen“. Produkt-ID ohne Preis im Code: `de.ojgutachter.gebrauchtwagencheck.pro`. Der Schalter wird erst umgelegt, nachdem das Produkt in Play Console und App Store Connect angelegt ist.
