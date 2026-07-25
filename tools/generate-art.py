"""Generiert alle Spielgrafiken automatisch ueber die Gemini-API (Nano Banana).

Nutzung:  python tools/generate-art.py [--only scene|char|icon] [--redo NAME]
Liest den Schluessel aus .env (GEMINI_API_KEY=...), speichert nach img/ai/.
Bereits vorhandene Dateien werden uebersprungen (loeschen = neu generieren).
"""
import base64
import json
import os
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'img', 'ai')
MODEL = 'gemini-2.5-flash-image'

STYLE = ("Style: cheerful 2D cartoon illustration for a children's game (age 5), "
         "soft gradients, thick clean outlines, rounded friendly shapes, bright "
         "saturated colors, NO text, NO letters, NO watermark.")
CHAR_STYLE = ("Single character only, full body, on a PURE WHITE background, "
              "no shadow, no ground, character fills most of the frame.")

SCENES = {
    'scene-hub': "Wide gentle meadow with soft rolling green hills, blue sky with a smiling sun in the upper left corner and a few fluffy clouds, small flowers at the bottom edges, one tree far left and a bush far right, the CENTER of the image mostly calm and uncluttered. Landscape 16:10.",
    'scene-huehner': "Sunny farm meadow: red wooden barn on the left side, light wooden fence across the upper middle, green grass filling the lower half kept open, blue sky with sun upper right and a few clouds. Landscape 16:10.",
    'scene-dino': "Prehistoric jungle: friendly volcano with small smoke puff on the right, palm trees on the left, distant green hills, warm yellow-orange sky, open grassy area across the lower half. Landscape 16:10.",
    'scene-garten': "Flower meadow seen from slightly above: colorful flowers and bushes ONLY around the edges as a frame, large EMPTY green lawn in the center, blue sky strip with sun at the top. Landscape 16:10.",
    'scene-kissen': "Cozy empty children's bedroom: pastel orange wall with polka dots, warm wooden floor, window with curtains on the left wall, framed picture on the right wall, NO furniture in the middle of the room. Landscape 16:10.",
    'scene-trampolin': "Sky scene: bright blue sky filling most of the image, smiling sun at the top center, fluffy clouds at different heights, narrow green grass strip along the bottom edge. Landscape 16:10.",
    'scene-schaukel': "Peaceful meadow: one large leafy tree on the left third, soft hills in the background, small flowers in the grass, blue sky with clouds, the center-right area open and calm. Landscape 16:10.",
    'scene-malbuch': "Dreamy soft pink and lavender sky with fluffy pastel clouds and tiny sparkling stars, very soft and calm, nothing in the center. Landscape 16:10.",
}

CHARS = {
    'char-huhn-1': "Cute white hen with red comb, standing, side view facing LEFT.",
    'char-huhn-2': "Cute white hen with red comb, mid-walk with one leg lifted and wings slightly raised, side view facing LEFT.",
    'char-rex-1': "Friendly small green T-Rex with big eyes, smiling, side view facing LEFT.",
    'char-rex-2': "Friendly small green T-Rex with mouth wide open, happily eating, side view facing LEFT.",
    'char-langhals-1': "Cute blue-teal long-neck dinosaur (Brontosaurus), smiling, side view facing LEFT.",
    'char-langhals-2': "Cute blue-teal long-neck dinosaur (Brontosaurus) happily munching with closed eyes, side view facing LEFT.",
    'char-drache-1': "Cute purple baby dragon with tiny wings and yellow horns, smiling.",
    'char-drache-2': "Cute purple baby dragon laughing with mouth open, happy.",
    'char-kind-1': "Happy 5-year-old boy with brown hair, red t-shirt and blue pants, jumping with arms up.",
    'char-kind-2': "Happy 5-year-old boy with brown hair, red t-shirt and blue pants, sitting with legs stretched forward, side view facing LEFT.",
    'char-teddy': "Cute plush teddy bear sitting, front view, big friendly eyes.",
    'char-hase': "Cute plush bunny with long ears sitting, front view.",
    'char-schwein': "Cute plush pink pig sitting, front view.",
    'char-koala': "Cute plush grey koala sitting, front view.",
}

ICON = {
    'app-icon': "App icon for a children's game: bright green meadow at the bottom, blue sky, one big golden star in the center above a small rainbow, bold simple shapes with thick outlines, vibrant colors, square format 1:1, no text.",
}

STICKERS = {
    'sticker-einhorn': "Cute white unicorn with pink mane and golden spiral horn, standing proudly.",
    'sticker-regenbogen': "Bright rainbow arc with two fluffy clouds at its ends.",
    'sticker-sonne': "Smiling sun with wavy golden rays and rosy cheeks.",
    'sticker-blume': "Single cheerful pink flower with green leaves and a smiling face.",
    'sticker-schmetterling': "Colorful butterfly with pink and purple patterned wings.",
    'sticker-ente': "Cute yellow duckling with orange beak, waving one wing.",
    'sticker-pilz': "Red toadstool mushroom with white dots and a happy face.",
    'sticker-eis': "Ice cream cone with three colorful scoops and a cherry on top.",
    'sticker-rakete': "Cute cartoon rocket with round window, red nose cone and small flame.",
    'sticker-auto': "Cute little red race car with big friendly eyes on the windshield.",
    'sticker-ball': "Colorful beach ball with red, yellow and blue segments.",
    'sticker-krone': "Golden royal crown with colorful gems.",
    'sticker-stern': "Happy golden star with a smiling face and little arms.",
    'sticker-torte': "Birthday cake with pink frosting and five colorful candles.",
    'sticker-ballon': "Bundle of three balloons in red, yellow and blue on strings.",
    'sticker-marienkaefer': "Cute red ladybug with black dots and big friendly eyes.",
}


def load_key():
    env = os.path.join(ROOT, '.env')
    if os.path.exists(env):
        for line in open(env, encoding='utf-8'):
            if line.strip().startswith('GEMINI_API_KEY='):
                key = line.split('=', 1)[1].strip()
                if key and 'einfuegen' not in key:
                    return key
    print('FEHLER: Kein Schluessel. .env mit GEMINI_API_KEY=... anlegen (siehe .env.example).')
    sys.exit(1)


def generate(key, name, prompt):
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}'
    body = json.dumps({
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {'responseModalities': ['IMAGE']},
    }).encode()
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read())
    for cand in data.get('candidates', []):
        for part in cand.get('content', {}).get('parts', []):
            blob = part.get('inlineData') or part.get('inline_data')
            if blob and blob.get('data'):
                path = os.path.join(OUT, name + '.png')
                with open(path, 'wb') as f:
                    f.write(base64.b64decode(blob['data']))
                return path
    raise RuntimeError(f'Keine Bilddaten in der Antwort: {json.dumps(data)[:400]}')


def main():
    only = None
    redo = None
    args = sys.argv[1:]
    if '--only' in args:
        only = args[args.index('--only') + 1]
    if '--redo' in args:
        redo = args[args.index('--redo') + 1]
    key = load_key()
    os.makedirs(OUT, exist_ok=True)

    jobs = []
    if only in (None, 'scene'):
        jobs += [(n, p + ' ' + STYLE) for n, p in SCENES.items()]
    if only in (None, 'char'):
        jobs += [(n, p + ' ' + CHAR_STYLE + ' ' + STYLE) for n, p in CHARS.items()]
    if only in (None, 'icon'):
        jobs += [(n, p + ' ' + STYLE) for n, p in ICON.items()]
    if only in (None, 'sticker'):
        jobs += [(n, p + ' ' + CHAR_STYLE + ' ' + STYLE) for n, p in STICKERS.items()]
    if redo:
        jobs = [(n, p) for n, p in jobs if n == redo]
        target = os.path.join(OUT, redo + '.png')
        if os.path.exists(target):
            os.remove(target)

    done = skipped = failed = 0
    for name, prompt in jobs:
        path = os.path.join(OUT, name + '.png')
        if os.path.exists(path):
            skipped += 1
            continue
        for attempt in (1, 2, 3):
            try:
                generate(key, name, prompt)
                kb = os.path.getsize(path) // 1024
                print(f'OK  {name}.png ({kb} KB)')
                done += 1
                break
            except Exception as e:
                msg = str(e)[:160]
                if attempt == 3:
                    print(f'FEHLER {name}: {msg}')
                    failed += 1
                else:
                    time.sleep(8 * attempt)  # Rate-Limit abwarten
        time.sleep(2)
    print(f'\nFertig: {done} neu, {skipped} uebersprungen, {failed} fehlgeschlagen.')


if __name__ == '__main__':
    main()
