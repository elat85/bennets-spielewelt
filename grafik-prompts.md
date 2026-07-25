# Gemini-Prompts für die Grafik-Offensive (Stand 2026-07-25)

**So geht's:** Prompt kopieren → in Gemini einfügen → beste Variante als PNG
speichern unter `C:\Users\SE\Documents\Claude\Projects\Privat\App bennet\img\ai\`
mit **genau dem angegebenen Dateinamen**. Dann sag mir Bescheid — ich erkenne
die Dateien, optimiere sie und baue sie ein. Reihenfolge egal, auch häppchenweise ok.

**Wichtig für einheitlichen Stil:** Häng an JEDEN Prompt den Stil-Block an und
füge als Referenz ein bereits generiertes Bild hinzu (z. B. die erste Szene,
sobald sie dir gefällt).

## Stil-Block (an jeden Prompt anhängen)

```
Style: cheerful 2D cartoon illustration for a children's game (age 5),
soft gradients, thick clean outlines, rounded friendly shapes, bright
saturated colors, NO text, NO letters, NO watermark, landscape 16:10.
```

## 1. Hintergrund-Szenen (8 Stück)

**scene-hub.png** — Hauptmenü
```
Wide gentle meadow with soft rolling green hills, blue sky with a smiling
sun in the upper left corner and a few fluffy clouds, small flowers at the
bottom edges, one tree far left and a bush far right, the CENTER of the
image mostly calm and uncluttered (game buttons will be placed there).
```

**scene-huehner.png** — Hühnerhof
```
Sunny farm meadow: red wooden barn on the left side, light wooden fence
across the upper middle, green grass filling the lower half (chickens will
run there, keep it open), blue sky with sun upper right and a few clouds.
```

**scene-dino.png** — Dino-Dschungel
```
Prehistoric jungle: friendly volcano with small smoke puff on the right,
palm trees on the left, distant green hills, warm yellow-orange sky,
open grassy area across the lower half (dinosaurs will stand there).
```

**scene-garten.png** — Garten
```
Flower meadow seen from slightly above: colorful flowers and bushes ONLY
around the edges as a frame, large EMPTY green lawn in the center (the
child will decorate it), blue sky strip with sun at the top.
```

**scene-kissen.png** — Kinderzimmer
```
Cozy empty children's bedroom: pastel orange wall with polka dots, warm
wooden floor, window with curtains on the left wall, framed picture on
the right wall, NO furniture in the middle of the room (furniture will be
added as game elements).
```

**scene-trampolin.png** — Himmel
```
Vertical-feeling sky scene: bright blue sky filling most of the image,
smiling sun at the top center, fluffy clouds at different heights,
narrow green grass strip along the bottom edge.
```

**scene-schaukel.png** — Schaukelwiese
```
Peaceful meadow: one large leafy tree on the left third, soft hills in
the background, small flowers in the grass, blue sky with clouds, the
center-right area open and calm (a swing will be placed there).
```

**scene-malbuch.png** — Malbuch-Hintergrund
```
Dreamy soft pink and lavender sky with fluffy pastel clouds and tiny
sparkling stars, very soft and calm, nothing in the center (a white
drawing card will cover most of it).
```

## 2. Figuren (weißer Hintergrund, für Freisteller)

Stil-Zusatz für ALLE Figuren (zusätzlich zum Stil-Block):
```
Single character only, full body, on a PURE WHITE background, no shadow,
no ground, character fills most of the frame.
```

| Dateiname | Prompt-Kern |
|---|---|
| char-huhn-1.png | Cute white hen with red comb, standing, side view facing LEFT |
| char-huhn-2.png | Same cute white hen, mid-walk with one leg lifted and wings slightly raised, side view facing LEFT |
| char-rex-1.png | Friendly small green T-Rex with big eyes, smiling, side view facing LEFT |
| char-rex-2.png | Same friendly green T-Rex with mouth wide open, happily eating |
| char-langhals-1.png | Cute blue-teal long-neck dinosaur (Brontosaurus), smiling, side view facing LEFT |
| char-langhals-2.png | Same blue long-neck dinosaur happily munching with closed eyes |
| char-drache-1.png | Cute purple baby dragon with tiny wings and yellow horns, smiling |
| char-drache-2.png | Same purple baby dragon laughing with mouth open, happy |
| char-kind-1.png | Happy 5-year-old boy with brown hair, red t-shirt and blue pants, jumping with arms up |
| char-kind-2.png | Same boy sitting with legs stretched forward (as if on a swing), side view facing LEFT |
| char-teddy.png | Cute plush teddy bear sitting, front view, big friendly eyes |
| char-hase.png | Cute plush bunny with long ears sitting, front view |
| char-schwein.png | Cute plush pink pig sitting, front view |
| char-koala.png | Cute plush grey koala sitting, front view |

## 3. App-Icon

**app-icon.png** (quadratisch, 1024×1024)
```
App icon for a children's game: bright green meadow at the bottom, blue
sky, one big golden star in the center above a small rainbow, bold simple
shapes with thick outlines, vibrant colors, square format, no text.
```

## Checkliste Dateien

- [ ] 8 × scene-*.png
- [ ] 14 × char-*.png
- [ ] 1 × app-icon.png

Alles nach `img\ai\` — ich übernehme Freistellen, Verkleinern und Einbau.
