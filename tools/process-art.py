"""Verarbeitet die KI-Rohbilder aus img/ai/ fuer die App:
- Szenen -> img/scenes/*.webp (1024px, q82)
- Figuren -> img/chars/*.webp (freigestellt: randverbundenes Weiss -> Alpha,
  weiche Kante, auf Inhalt beschnitten, max 512px)
- App-Icon -> icons/icon-512.png + icon-192.png (Raender beschnitten)
"""
import os
from collections import deque

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AI = os.path.join(ROOT, 'img', 'ai')
SCENES = os.path.join(ROOT, 'img', 'scenes')
CHARS = os.path.join(ROOT, 'img', 'chars')
os.makedirs(SCENES, exist_ok=True)
os.makedirs(CHARS, exist_ok=True)


def cutout(im, tol=18):
    """Randverbundenes Fast-Weiss transparent machen (Flood von allen Raendern)."""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    mask = bytearray(w * h)  # 1 = Hintergrund
    q = deque()
    thr = 255 - tol

    def is_bg(x, y):
        r, g, b, a = px[x, y]
        return r >= thr and g >= thr and b >= thr

    for x in range(w):
        for y in (0, h - 1):
            if is_bg(x, y) and not mask[y * w + x]:
                mask[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(x, y) and not mask[y * w + x]:
                mask[y * w + x] = 1
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not mask[ny * w + nx] and is_bg(nx, ny):
                mask[ny * w + nx] = 1
                q.append((nx, ny))

    alpha = Image.frombytes('L', (w, h), bytes(255 - m * 255 for m in mask))
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.1))  # weiche Kante
    im.putalpha(alpha)
    box = im.getbbox()
    if box:
        pad = 8
        box = (max(0, box[0] - pad), max(0, box[1] - pad),
               min(w, box[2] + pad), min(h, box[3] + pad))
        im = im.crop(box)
    return im


def main():
    for f in sorted(os.listdir(AI)):
        if not f.endswith('.png'):
            continue
        src = os.path.join(AI, f)
        base = f[:-4]
        im = Image.open(src)
        if base.startswith('scene-'):
            im = im.convert('RGB')
            im.thumbnail((1024, 1024), Image.LANCZOS)
            out = os.path.join(SCENES, base[6:] + '.webp')
            im.save(out, 'WEBP', quality=82)
        elif base.startswith('char-'):
            im = cutout(im)
            im.thumbnail((512, 512), Image.LANCZOS)
            out = os.path.join(CHARS, base[5:] + '.webp')
            im.save(out, 'WEBP', quality=90)
        elif base.startswith('sticker-'):
            stickers_dir = os.path.join(ROOT, 'img', 'stickers')
            os.makedirs(stickers_dir, exist_ok=True)
            im = cutout(im)
            im.thumbnail((320, 320), Image.LANCZOS)
            out = os.path.join(stickers_dir, base[8:] + '.webp')
            im.save(out, 'WEBP', quality=88)
        elif base == 'app-icon':
            w, h = im.size
            m = int(w * 0.055)  # weisse Ecken der Icon-Rundung abschneiden
            im = im.convert('RGB').crop((m, m, w - m, h - m))
            for size in (512, 192):
                icon = im.resize((size, size), Image.LANCZOS)
                icon.save(os.path.join(ROOT, 'icons', f'icon-{size}.png'), optimize=True)
            out = 'icons/icon-512+192.png'
        else:
            continue
        print(f'OK {base} -> {out}')

    for d in (SCENES, CHARS):
        total = sum(os.path.getsize(os.path.join(d, x)) for x in os.listdir(d))
        print(f'{os.path.basename(d)}: {len(os.listdir(d))} Dateien, {total // 1024} KB gesamt')


if __name__ == '__main__':
    main()
