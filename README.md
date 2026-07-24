# 🌈 Bennets Spielewelt

Eine Spiele-App für Bennet (5–6 Jahre) — läuft im Browser auf jedem Tablet,
funktioniert nach dem ersten Öffnen auch offline. Ohne Werbung, ohne Käufe,
ohne Internet-Links, ohne Datenerfassung.

**App öffnen:** https://elat85.github.io/bennets-spielewelt/

## Die Spiele

| Spiel | So geht's |
|---|---|
| 🦖 Dinos füttern | Futter zum richtigen Dino ziehen (T-Rex mag Fleisch, Langhals mag Pflanzen, der Drache frisst alles). 8× füttern = ⭐ |
| 🦄 Malbuch | 7 Ausmalbilder, Stifte-Box mit 13 Buntstiften + Glitzer, Regenbogen, Muster, Stempel, Zauberstift und Radierer. Motiv ausgemalt = ⭐, Bild landet in der Galerie |
| 🌷 Garten dekorieren | Sachen aus der Leiste auf die Wiese ziehen. Der Garten bleibt gespeichert. 8 neue Sachen = ⭐ |
| 🐔 Hühner füttern | Auf die Wiese tippen streut Körner. Eier antippen zum Einsammeln, 3 Eier = ⭐ |
| 🤸 Trampolin | Schnell tippen gibt Schwung — bis zur Sonne hüpfen = ⭐ |
| 🛏️ Kissenschlacht | Auf die frechen Plüschtiere tippen und mit Kissen abwerfen. 10 Treffer = ⭐ |
| 🧒 Schaukeln | Im Takt tippen zum Anschwingen — richtig hoch = 🌈 + ⭐ |

## Auf dem Tablet „installieren"

Die App legt sich wie eine echte App auf den Startbildschirm — danach startet
sie im Vollbild und läuft auch ohne WLAN.

**Samsung Galaxy Tab A9 (Chrome):**
1. Link oben in Chrome öffnen
2. Menü (⋮ oben rechts) → **„Zum Startbildschirm hinzufügen"** (bzw. „App installieren")
3. Bestätigen — fertig, Icon liegt auf dem Startbildschirm

**Amazon Fire Tablet (Silk-Browser):**
1. Link oben in Silk öffnen
2. Menü (⋮) → **„Seite zum Startbildschirm hinzufügen"**
3. Bestätigen — fertig

**Tipp:** Beim allerersten Öffnen einmal kurz mit WLAN laden, damit sich die App
für den Offline-Betrieb speichert. Tablet am besten quer halten.

## Technik

Reines HTML/CSS/JavaScript ohne Build-System. PWA mit Service Worker
(offline-fähig, stale-while-revalidate). Sounds werden per Web Audio API
synthetisiert, Grafiken sind SVG/Emoji — keine externen Ressourcen, keine
Abhängigkeiten.

Lokal starten: `python serve.py` (Dev-Server ohne Caching), dann
http://localhost:8642 öffnen.

## Update veröffentlichen

Dateien ändern, dann committen und pushen — GitHub Pages aktualisiert
automatisch (1–2 Minuten). In `sw.js` die Zeile `const CACHE = 'bennet-v1'`
auf `v2`, `v3` … erhöhen, damit installierte Tablets das Update sicher bekommen.
