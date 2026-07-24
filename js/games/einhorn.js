/* Malspiel: Ausmalbilder mit Farbeimer-Prinzip und einer Stifte-Box.
   Buntstifte füllen Flächen, dazu Spezialstifte: Radierer, Glitzer,
   Regenbogen, Muster (Punkte/Streifen/Herzen), Stempel und Zauberstift.
   ~80 % vom Motiv (ohne Hintergrund) ausgemalt = 1 Stern. */
(window.GameModules = window.GameModules || {}).einhorn = {
  title: 'Malbuch',
  tileClass: 'tile-einhorn',

  start(stage, api) {
    /* Weitere Motive einfach hier ergänzen (Datei zusätzlich in sw.js eintragen) */
    const MOTIFS = [
      { id: 'einhorn',        file: 'img/einhorn.png' },
      { id: 'regenbogen',     file: 'img/regenbogen.png' },
      { id: 'zauberwiese',    file: 'img/zauberwiese.png' },
      { id: 'prinzessin',     file: 'img/prinzessin.png' },
      { id: 'papa-grillt',    file: 'img/papa-grillt.png' },
      { id: 'geburtstag',     file: 'img/geburtstag.png' },
      { id: 'zahlen-einhorn', file: 'img/zahlen-einhorn.png' }
    ];

    stage.style.background = 'linear-gradient(180deg, #ffd9ec 0%, #f8bbd0 100%)';

    const PENCILS = ['#ff5252', '#ff7043', '#ffa726', '#ffee58', '#d4e157', '#66bb6a',
                     '#26a69a', '#4fc3f7', '#5c6bc0', '#ab47bc', '#f48fb1', '#8d6e63', '#90a4ae'];
    const SIZE = 1024;
    let tool = { type: 'fill', color: '#f48fb1' };
    let lastColor = '#f48fb1';
    let starGiven = false;
    let whiteAtStart = 1;
    let ready = false;
    let bgMask = null;
    let canvas = null, ctx = null;

    const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const RAINBOW = ['#ff5252', '#ffa726', '#ffee58', '#66bb6a', '#4fc3f7', '#ab47bc'].map(hex2rgb);

    /* ---------- Stift-Grafiken für die Box ---------- */
    let pid = 0;
    function pencilSvg(bodyFill, emblem = '', defs = '') {
      return `<svg viewBox="0 0 40 120" style="display:block; width:100%; height:100%;">
        ${defs}
        <path d="M20 2 L30 26 L10 26 Z" fill="#e8c9a0" stroke="#b3855a" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M20 2 L24 12 L16 12 Z" fill="#5a4632"/>
        <rect x="10" y="26" width="20" height="82" rx="4" fill="${bodyFill}" stroke="rgba(0,0,0,.25)" stroke-width="2.5"/>
        <rect x="13" y="28" width="4" height="78" rx="2" fill="rgba(255,255,255,.35)"/>
        ${emblem}
      </svg>`;
    }
    const TOOL_PENS = [
      { key: 'eraser', make() {
          return `<svg viewBox="0 0 40 120" style="display:block; width:100%; height:100%;">
            <rect x="8" y="30" width="24" height="56" rx="8" fill="#ff8fb3" stroke="#d6688e" stroke-width="3"/>
            <rect x="8" y="58" width="24" height="28" rx="8" fill="#68b8e8" stroke="#4a8fbf" stroke-width="3"/>
            <rect x="12" y="38" width="5" height="30" rx="2.5" fill="rgba(255,255,255,.5)"/>
          </svg>`;
        } },
      { key: 'glitter', make() {
          const g = 'pgl' + (++pid);
          return pencilSvg(`url(#${g})`,
            `<path d="M20 44 L23 53 L32 54 L25 60 L27 69 L20 64 L13 69 L15 60 L8 54 L17 53 Z" fill="#fff" stroke="#e8a000" stroke-width="2"/>`,
            `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe266"/><stop offset="100%" stop-color="#e8a000"/></linearGradient></defs>`);
        } },
      { key: 'rainbow', make() {
          const g = 'prb' + (++pid);
          return pencilSvg(`url(#${g})`, '',
            `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ff5252"/><stop offset="25%" stop-color="#ffa726"/>
              <stop offset="45%" stop-color="#ffee58"/><stop offset="65%" stop-color="#66bb6a"/>
              <stop offset="85%" stop-color="#4fc3f7"/><stop offset="100%" stop-color="#ab47bc"/>
            </linearGradient></defs>`);
        } },
      { key: 'dots', make() {
          const p = 'pdo' + (++pid);
          return pencilSvg(`url(#${p})`, '',
            `<defs><pattern id="${p}" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#f48fb1"/><circle cx="6" cy="6" r="3" fill="#fff"/>
            </pattern></defs>`);
        } },
      { key: 'stripes', make() {
          const p = 'pst' + (++pid);
          return pencilSvg(`url(#${p})`, '',
            `<defs><pattern id="${p}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="12" height="12" fill="#4fc3f7"/><rect width="6" height="12" fill="#fff"/>
            </pattern></defs>`);
        } },
      { key: 'hearts', make() {
          return pencilSvg('#ffd9ec',
            `<path d="M20 66 Q12 59 12 53 Q12 48 16.5 49 Q19 50 20 53 Q21 50 23.5 49 Q28 48 28 53 Q28 59 20 66 Z" fill="#ff5252" stroke="#d64545" stroke-width="1.5"/>`);
        } },
      { key: 'stamp', make() {
          return `<svg viewBox="0 0 40 120" style="display:block; width:100%; height:100%;">
            <rect x="6" y="76" width="28" height="12" rx="4" fill="#8d6748" stroke="#6b4b3a" stroke-width="2.5"/>
            <path d="M14 76 Q14 58 20 54 Q26 58 26 76 Z" fill="#a5784e" stroke="#6b4b3a" stroke-width="2.5"/>
            <circle cx="20" cy="46" r="10" fill="#e05d4b" stroke="#a8433a" stroke-width="2.5"/>
            <path d="M20 42 L21.5 45 L25 45.3 L22.4 47.5 L23.2 51 L20 49 L16.8 51 L17.6 47.5 L15 45.3 L18.5 45 Z" fill="#fff"/>
          </svg>`;
        } },
      { key: 'magic', make() {
          const g = 'pmg' + (++pid);
          return pencilSvg(`url(#${g})`,
            `<circle cx="20" cy="52" r="5" fill="#fff" opacity=".9"/><circle cx="26" cy="64" r="3" fill="#fff" opacity=".7"/><circle cx="14" cy="72" r="2.5" fill="#fff" opacity=".7"/>`,
            `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff9ad5"/><stop offset="100%" stop-color="#8fd3ff"/></linearGradient></defs>`);
        } }
    ];

    /* ---------- Aufbau ---------- */
    stage.innerHTML = `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:0;">
        <div style="position:absolute; top:5%; width:clamp(80px,12vw,140px); aspect-ratio:16/9; opacity:.8; animation:float-cloud 55s linear infinite;">${Art.cloud()}</div>
        <div style="position:absolute; top:58%; width:clamp(60px,9vw,110px); aspect-ratio:16/9; opacity:.6; animation:float-cloud 75s linear infinite; animation-delay:-40s;">${Art.cloud()}</div>
      </div>
      <div id="eh-frame" style="position:absolute; left:50%; top:44%; transform:translate(-50%,-50%);
        background:#fff; border-radius:24px; box-shadow:0 6px 20px rgba(0,0,0,.18); padding:8px; touch-action:none;"></div>
      <div id="eh-box" style="position:absolute; left:50%; bottom:0; transform:translateX(-50%);
        display:flex; gap:4px; align-items:flex-end; z-index:30; max-width:98vw; overflow-x:auto;
        background:linear-gradient(180deg,#a5784e,#8d6748); border:3px solid #6b4b3a; border-bottom:none;
        border-radius:18px 18px 0 0; padding:8px 12px 0;
        box-shadow:inset 0 3px 0 rgba(255,255,255,.25), 0 -6px 14px rgba(0,0,0,.2);"></div>
      <div id="eh-gallery" style="position:absolute; left:8px; top:50%; transform:translateY(-50%);
        display:flex; flex-direction:column; gap:8px; z-index:30;"></div>
      <button id="eh-new" class="btn-round" style="position:absolute; right:12px; bottom:14px; z-index:31;"><span class="icon">${Art.reset()}</span></button>
      <button id="eh-pick" class="btn-round" style="position:absolute; right:12px; bottom:calc(14px + clamp(66px,10vw,90px)); z-index:31;"><span class="icon" style="width:74%; height:74%;">${Art.picture()}</span></button>
      <div id="eh-chooser" style="position:absolute; inset:0; z-index:40; display:none; overflow-y:auto; touch-action:pan-y;
        background:linear-gradient(180deg, #ffd9ec 0%, #f8bbd0 100%); padding:clamp(60px,10vh,90px) 4vw 20px;">
        <div style="text-align:center; font-size:clamp(22px,4vw,34px); font-weight:700; color:#a5487e; margin-bottom:14px;">Such dir ein Bild aus!</div>
        <div id="eh-chooser-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(clamp(150px,24vw,260px), 1fr)); gap:14px; max-width:1100px; margin:0 auto;"></div>
      </div>`;

    const frame = stage.querySelector('#eh-frame');
    const box = stage.querySelector('#eh-box');
    const galleryEl = stage.querySelector('#eh-gallery');

    /* ---------- Motiv laden ---------- */
    const img = new Image();
    function openMotif(motif) {
      ready = false;
      img.onload = () => {
        const ar = img.naturalWidth / img.naturalHeight;
        canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = Math.round(SIZE / ar);
        canvas.style.cssText = 'display:block; border-radius:16px; touch-action:none;';
        // Rahmen an Bildformat und Platz anpassen
        frame.innerHTML = '';
        frame.appendChild(canvas);
        const fit = () => {
          const availH = stage.clientHeight * 0.66;
          const availW = stage.clientWidth * 0.72;
          const w = Math.min(availW, availH * ar);
          canvas.style.width = w + 'px';
          canvas.style.height = (w / ar) + 'px';
        };
        fit();
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.addEventListener('pointerdown', onPaint);
        canvas.addEventListener('pointerdown', () => { dragTool = (tool.type === 'glitter' || tool.type === 'stamp'); });
        canvas.addEventListener('pointermove', onDragPaint);
        resetCanvas(true);
        ready = true;
        updateProgress();
      };
      img.src = motif.file;
    }

    function resetCanvas(first) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (first) buildBgMask();
      whiteAtStart = countWhite();
      starGiven = false;
      updateProgress();
    }

    /* Hintergrund von den Ecken aus markieren – zählt nicht als "ausgemalt" */
    function buildBgMask() {
      const W = canvas.width, H = canvas.height;
      const d = ctx.getImageData(0, 0, W, H).data;
      const isLine = i => d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120;
      bgMask = new Uint8Array(W * H);
      const queue = [0, W - 1, (H - 1) * W, W * H - 1].filter(p => !isLine(p * 4));
      queue.forEach(p => { bgMask[p] = 1; });
      while (queue.length) {
        const p = queue.pop();
        const x = p % W, y = (p / W) | 0;
        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const np = ny * W + nx;
          if (bgMask[np] || isLine(np * 4)) continue;
          bgMask[np] = 1;
          queue.push(np);
        }
      }
    }

    function countWhite() {
      const W = canvas.width, H = canvas.height;
      const d = ctx.getImageData(0, 0, W, H).data;
      let n = 0;
      for (let p = 0; p < W * H; p += 3) {
        if (bgMask && bgMask[p]) continue;
        const i = p * 4;
        if (d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235) n++;
      }
      return Math.max(n, 1);
    }

    function updateProgress() {
      const frac = ready ? Math.min(1 - countWhite() / whiteAtStart, 1) : 0;
      const steps = Math.min(Math.floor(frac / 0.08), 10);
      api.setProgress(`<span class="icon" style="width:1.2em; height:1.2em;">${Art.particles.sparkle}</span>&nbsp;${steps} / 10`);
      return steps;
    }

    /* ---------- Farbeimer ---------- */
    function floodFill(sx, sy, colorAt) {
      const W = canvas.width, H = canvas.height;
      const imgData = ctx.getImageData(0, 0, W, H);
      const d = imgData.data;
      const idx = (x, y) => (y * W + x) * 4;
      const isLine = i => d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120;
      if (isLine(idx(sx, sy))) return null;
      const visited = new Uint8Array(W * H);
      const stack = [[sx, sy]];
      const samples = [];
      let count = 0;
      while (stack.length) {
        const [px, y] = stack.pop();
        let x = px;
        while (x >= 0 && !visited[y * W + x] && !isLine(idx(x, y))) x--;
        x++;
        let above = false, below = false;
        while (x < W && !visited[y * W + x] && !isLine(idx(x, y))) {
          visited[y * W + x] = 1;
          const i = idx(x, y);
          const c = colorAt(x, y);
          d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
          if (++count % 900 === 0) samples.push([x, y]);
          if (y > 0) {
            const ok = !visited[(y - 1) * W + x] && !isLine(idx(x, y - 1));
            if (ok && !above) { stack.push([x, y - 1]); above = true; } else if (!ok) above = false;
          }
          if (y < H - 1) {
            const ok = !visited[(y + 1) * W + x] && !isLine(idx(x, y + 1));
            if (ok && !below) { stack.push([x, y + 1]); below = true; } else if (!ok) below = false;
          }
          x++;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return samples;
    }

    /* ---------- Stempel-Formen ---------- */
    function stampStar(x, y, size, fill = '#ffd93b', stroke = '#e8a000') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? size : size * 0.45;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 3;
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    function stampHeart(x, y, size, fill) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 20, size / 20);
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-16, 0, -10, -14, 0, -6);
      ctx.bezierCurveTo(10, -14, 16, 0, 0, 12);
      ctx.fillStyle = fill; ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    function stampFlower(x, y, size, fill) {
      ctx.save();
      ctx.translate(x, y);
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.7, size * 0.38, size * 0.62, 0, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd93b'; ctx.strokeStyle = '#e8a000'; ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    const STAMP_COLORS = ['#ff5252', '#f48fb1', '#ab47bc', '#4fc3f7', '#66bb6a', '#ffa726'];
    function randomStamp(x, y) {
      const c = STAMP_COLORS[Math.floor(Math.random() * STAMP_COLORS.length)];
      const s = 20 + Math.random() * 14;
      const which = Math.floor(Math.random() * 3);
      if (which === 0) stampHeart(x, y, s, c);
      else if (which === 1) stampFlower(x, y, s, c);
      else stampStar(x, y, s, c, 'rgba(0,0,0,.25)');
    }

    /* ---------- Muster & Spezialfüllungen ---------- */
    const WHITE = [255, 255, 255];
    function fillColorAt() {
      const H = canvas.height;
      switch (tool.type) {
        case 'fill':    { const c = hex2rgb(tool.color); return () => c; }
        case 'eraser':  return () => WHITE;
        case 'rainbow': return (x, y) => RAINBOW[Math.floor(((x + y) / (canvas.width + H)) * RAINBOW.length * 1.5) % RAINBOW.length];
        case 'dots':    { const base = hex2rgb(lastColor); return (x, y) => { const u = x % 56 - 28, v = y % 56 - 28; return (u * u + v * v < 165) ? WHITE : base; }; }
        case 'stripes': { const base = hex2rgb(lastColor); return (x, y) => ((((x + y) / 30) | 0) % 2 === 0 ? base : WHITE); }
        case 'hearts':  { const base = hex2rgb(lastColor); return (x, y) => {
            const u = (x % 64 - 32) / 15, v = -(y % 64 - 30) / 15;
            const q = u * u + v * v - 1;
            return (q * q * q - u * u * v * v * v < 0) ? WHITE : base;
          }; }
        case 'magic':   { const a = hex2rgb('#ff9ad5'), b = hex2rgb('#8fd3ff');
          return (x, y) => { const t = y / H; return [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t)); }; }
      }
      return null;
    }

    /* ---------- Malen ---------- */
    let dragTool = false;
    function onPaint(e) {
      if (!ready) return;
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const x = Math.floor((e.clientX - r.left) * (canvas.width / r.width));
      const y = Math.floor((e.clientY - r.top) * (canvas.height / r.height));
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
      const sr = stage.getBoundingClientRect();

      if (tool.type === 'glitter') {
        stampStar(x, y, 16 + Math.random() * 12);
        Sound.play('sparkle');
        api.burst(e.clientX - sr.left, e.clientY - sr.top, ['sparkle', 'heart'], 4, 20);
        return;
      }
      if (tool.type === 'stamp') {
        randomStamp(x, y);
        Sound.play('pop');
        api.burst(e.clientX - sr.left, e.clientY - sr.top, ['sparkle'], 3, 16);
        return;
      }
      const colorAt = fillColorAt();
      if (!colorAt) return;
      const samples = floodFill(x, y, colorAt);
      if (samples) {
        Sound.play(tool.type === 'magic' ? 'sparkle' : 'pop');
        if (tool.type === 'magic') {
          // ein paar Glitzersterne in die verzauberte Fläche
          samples.slice(0, 3).forEach(([px, py]) => stampStar(px, py, 10 + Math.random() * 8, '#ffffff', '#c9b5e8'));
        }
        const steps = updateProgress();
        if (steps >= 10 && !starGiven) {
          starGiven = true;
          Sound.play('yay');
          saveToGallery();
          api.awardStar();
        }
      }
    }
    function onDragPaint(e) {
      if (dragTool && (tool.type === 'glitter' || tool.type === 'stamp') && Math.random() < 0.3) onPaint(e);
    }
    function stopDrag() { dragTool = false; }
    window.addEventListener('pointerup', stopDrag);

    /* ---------- Stifte-Box ---------- */
    function makePen(html, onSelect) {
      const b = document.createElement('button');
      b.style.cssText = `width:clamp(30px,4.4vw,44px); height:clamp(80px,12vw,118px); border:none;
        background:none; padding:0; cursor:pointer; flex:0 0 auto;
        transition:transform .12s; transform:translateY(24%); filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));`;
      b.innerHTML = html;
      b.addEventListener('pointerdown', () => {
        Sound.play('tap');
        onSelect();
        [...box.children].forEach(c => c.style.transform = 'translateY(24%)');
        b.style.transform = 'translateY(2%) scale(1.08)';
      });
      box.appendChild(b);
      return b;
    }
    PENCILS.forEach(c => makePen(pencilSvg(c), () => { tool = { type: 'fill', color: c }; lastColor = c; }));
    TOOL_PENS.forEach(t => makePen(t.make(), () => { tool = { type: t.key }; }));
    box.children[10].dispatchEvent(new PointerEvent('pointerdown')); // Pink vorauswählen

    /* ---------- Galerie ---------- */
    function saveToGallery() {
      try {
        const thumb = document.createElement('canvas');
        const ar = canvas.width / canvas.height;
        thumb.width = 512; thumb.height = Math.round(512 / ar);
        thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height);
        const gallery = Storage.get('einhorn.gallery2', []);
        gallery.unshift(thumb.toDataURL('image/jpeg', 0.82));
        Storage.set('einhorn.gallery2', gallery.slice(0, 4));
        renderGallery();
      } catch (e) { /* Speicher voll – Galerie ist optional */ }
    }
    function renderGallery() {
      const gallery = Storage.get('einhorn.gallery2', []);
      galleryEl.innerHTML = '';
      gallery.forEach(dataUrl => {
        const mini = document.createElement('button');
        mini.style.cssText = `width:clamp(54px,8vw,80px); aspect-ratio:4/3; background:#fff;
          border:3px solid #f48fb1; border-radius:12px; padding:2px; cursor:pointer; overflow:hidden;`;
        mini.innerHTML = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">`;
        mini.addEventListener('pointerdown', () => {
          Sound.play('pop');
          const li = new Image();
          li.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(li, 0, 0, canvas.width, canvas.height);
            starGiven = true; // geladenes Bild gibt keinen neuen Stern
            updateProgress();
          };
          li.src = dataUrl;
        });
        galleryEl.appendChild(mini);
      });
    }
    renderGallery();

    /* ---------- Neues Bild / Bildauswahl ---------- */
    stage.querySelector('#eh-new').addEventListener('pointerdown', () => {
      if (!ready) return;
      Sound.play('whoosh');
      const frac = 1 - countWhite() / whiteAtStart;
      if (frac > 0.3 && !starGiven) saveToGallery(); // angefangenes Werk nicht verlieren
      resetCanvas(false);
    });

    const chooser = stage.querySelector('#eh-chooser');
    const chooserGrid = stage.querySelector('#eh-chooser-grid');
    MOTIFS.forEach(m => {
      const card = document.createElement('button');
      card.style.cssText = `background:#fff; border:4px solid #f48fb1; border-radius:18px; padding:6px;
        cursor:pointer; box-shadow:0 5px 0 #d6688e, 0 9px 14px rgba(0,0,0,.18); transition:transform .12s;`;
      card.innerHTML = `<img src="${m.file}" loading="lazy" style="width:100%; display:block; border-radius:12px;">`;
      card.addEventListener('pointerdown', () => {
        Sound.play('pop');
        chooser.style.display = 'none';
        openMotif(m);
      });
      chooserGrid.appendChild(card);
    });
    function showChooser() {
      if (ready) {
        const frac = 1 - countWhite() / whiteAtStart;
        if (frac > 0.3 && !starGiven) saveToGallery();
      }
      chooser.style.display = 'block';
    }
    stage.querySelector('#eh-pick').addEventListener('pointerdown', () => {
      Sound.play('tap');
      showChooser();
    });

    chooser.style.display = 'block'; // Start: erst Bild aussuchen

    return () => {
      window.removeEventListener('pointerup', stopDrag);
    };
  }
};
