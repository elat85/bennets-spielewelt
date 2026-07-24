/* Einhorn anmalen: Farbe antippen, dann Fläche antippen (Farbeimer-Prinzip
   auf einem Ausmalbild). Extra: Glitzer-Stempel und Regenbogenfarbe.
   Fertige Bilder landen in einer kleinen Galerie. ~70 % ausgemalt = 1 Stern
   (viele Klein-Flächen wie Glanzpunkte sind für Kinder nicht erreichbar). */
(window.GameModules = window.GameModules || {}).einhorn = {
  title: 'Einhorn anmalen',
  tileClass: 'tile-einhorn',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #ffd9ec 0%, #f8bbd0 100%)';
    stage.innerHTML = `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:0;">
        <div style="position:absolute; top:5%; width:clamp(80px,12vw,140px); aspect-ratio:16/9; opacity:.8; animation:float-cloud 55s linear infinite;">${Art.cloud()}</div>
        <div style="position:absolute; top:64%; width:clamp(60px,9vw,110px); aspect-ratio:16/9; opacity:.6; animation:float-cloud 75s linear infinite; animation-delay:-40s;">${Art.cloud()}</div>
      </div>
      <div id="eh-frame" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-54%);
        width:min(66vw, 62vh); aspect-ratio:1; background:#fff; border-radius:24px;
        box-shadow:0 6px 20px rgba(0,0,0,.18); padding:8px; touch-action:none;">
        <canvas id="eh-canvas" style="width:100%; height:100%; display:block; border-radius:16px;"></canvas>
      </div>
      <div id="eh-palette" style="position:absolute; left:50%; bottom:8px; transform:translateX(-50%);
        display:flex; gap:10px; background:rgba(255,255,255,.92); padding:10px 14px; border-radius:40px;
        box-shadow:0 4px 10px rgba(0,0,0,.2); z-index:30; max-width:96vw; flex-wrap:wrap; justify-content:center;"></div>
      <div id="eh-gallery" style="position:absolute; left:8px; top:50%; transform:translateY(-50%);
        display:flex; flex-direction:column; gap:8px; z-index:30;"></div>
      <button id="eh-new" class="btn-round" style="position:absolute; right:12px; bottom:14px; z-index:30;"><span class="icon">${Art.reset()}</span></button>`;

    const COLORS = ['#ff5252', '#ffa726', '#ffee58', '#66bb6a', '#4fc3f7', '#5c6bc0',
                    '#ab47bc', '#f48fb1', '#8d6e63', '#ffffff'];
    const SIZE = 1024;
    const canvas = stage.querySelector('#eh-canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let tool = '#f48fb1';
    let starGiven = false;
    let whiteAtStart = 1;
    let ready = false;
    let bgMask = null; // markiert den Hintergrund – der zählt nicht als "ausgemalt"

    /* Ausmalbild laden */
    const img = new Image();
    img.src = 'img/einhorn.png';
    img.onload = () => {
      resetCanvas(true);
      ready = true;
      updateProgress();
    };

    function resetCanvas(first) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      if (first) buildBgMask();
      whiteAtStart = countWhite();
      starGiven = false;
      updateProgress();
    }

    /* Hintergrund von den Ecken aus markieren (BFS über Nicht-Linien-Pixel) */
    function buildBgMask() {
      const d = ctx.getImageData(0, 0, SIZE, SIZE).data;
      const isLine = i => d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120;
      bgMask = new Uint8Array(SIZE * SIZE);
      const queue = [0, SIZE - 1, (SIZE - 1) * SIZE, SIZE * SIZE - 1];
      queue.forEach(p => { bgMask[p] = 1; });
      while (queue.length) {
        const p = queue.pop();
        const x = p % SIZE, y = (p / SIZE) | 0;
        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) continue;
          const np = ny * SIZE + nx;
          if (bgMask[np] || isLine(np * 4)) continue;
          bgMask[np] = 1;
          queue.push(np);
        }
      }
    }

    /* Weiße Pixel IM Einhorn zählen (Stichprobe jedes 3. Pixel) */
    function countWhite() {
      const d = ctx.getImageData(0, 0, SIZE, SIZE).data;
      let n = 0;
      for (let p = 0; p < SIZE * SIZE; p += 3) {
        if (bgMask && bgMask[p]) continue;
        const i = p * 4;
        if (d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235) n++;
      }
      return Math.max(n, 1);
    }

    function coloredFraction() {
      return Math.min(1 - countWhite() / whiteAtStart, 1);
    }

    function updateProgress() {
      const steps = ready ? Math.min(Math.floor(coloredFraction() / 0.08), 10) : 0;
      api.setProgress(`<span class="icon" style="width:1.2em; height:1.2em;">${Art.particles.sparkle}</span>&nbsp;${steps} / 10`);
      return steps;
    }

    /* Farbeimer: Scanline-Flood-Fill, schwarze Linien sind die Grenze */
    function floodFill(sx, sy, colorAt) {
      const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
      const d = imgData.data;
      const idx = (x, y) => (y * SIZE + x) * 4;
      const isLine = i => d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120;
      if (isLine(idx(sx, sy))) return false; // direkt auf der Linie getippt
      const visited = new Uint8Array(SIZE * SIZE);
      const stack = [[sx, sy]];
      while (stack.length) {
        const [px, y] = stack.pop();
        let x = px;
        while (x >= 0 && !visited[y * SIZE + x] && !isLine(idx(x, y))) x--;
        x++;
        let above = false, below = false;
        while (x < SIZE && !visited[y * SIZE + x] && !isLine(idx(x, y))) {
          visited[y * SIZE + x] = 1;
          const i = idx(x, y);
          const [r, g, b] = colorAt(x, y);
          d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
          if (y > 0) {
            const ok = !visited[(y - 1) * SIZE + x] && !isLine(idx(x, y - 1));
            if (ok && !above) { stack.push([x, y - 1]); above = true; } else if (!ok) above = false;
          }
          if (y < SIZE - 1) {
            const ok = !visited[(y + 1) * SIZE + x] && !isLine(idx(x, y + 1));
            if (ok && !below) { stack.push([x, y + 1]); below = true; } else if (!ok) below = false;
          }
          x++;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return true;
    }

    const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const RAINBOW = ['#ff5252', '#ffa726', '#ffee58', '#66bb6a', '#4fc3f7', '#ab47bc'].map(hex2rgb);

    /* Glitzer-Stempel: kleiner Goldstern direkt ins Bild */
    function stampStar(x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      const s = 16 + Math.random() * 14;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? s : s * 0.45;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#ffd93b';
      ctx.strokeStyle = '#e8a000';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    /* Malen */
    function onPaint(e) {
      if (!ready) return;
      const r = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) * (SIZE / r.width));
      const y = Math.floor((e.clientY - r.top) * (SIZE / r.height));
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
      const sr = stage.getBoundingClientRect();

      if (tool === 'glitter') {
        stampStar(x, y);
        Sound.play('sparkle');
        api.burst(e.clientX - sr.left, e.clientY - sr.top, ['sparkle', 'heart'], 5, 20);
        return;
      }
      const colorAt = tool === 'rainbow'
        ? (px, py) => RAINBOW[Math.floor(((px + py) / (SIZE * 2)) * RAINBOW.length * 2) % RAINBOW.length]
        : (() => { const c = hex2rgb(tool); return () => c; })();
      if (floodFill(x, y, colorAt)) {
        Sound.play('pop');
        const steps = updateProgress();
        if (steps >= 10 && !starGiven) {
          starGiven = true;
          Sound.play('yay');
          saveToGallery();
          api.awardStar();
        }
      }
    }
    canvas.addEventListener('pointerdown', onPaint);
    let glitterDrag = false;
    canvas.addEventListener('pointerdown', () => { glitterDrag = tool === 'glitter'; });
    canvas.addEventListener('pointermove', (e) => {
      if (glitterDrag && tool === 'glitter' && Math.random() < 0.3) onPaint(e);
    });
    window.addEventListener('pointerup', stopGlitter);
    function stopGlitter() { glitterDrag = false; }

    /* Palette */
    const palette = stage.querySelector('#eh-palette');
    function makeSwatch(bg, value, label) {
      const b = document.createElement('button');
      b.style.cssText = `width:clamp(40px,6vw,56px); height:clamp(40px,6vw,56px); border-radius:50%;
        border:4px solid #fff; outline:3px solid rgba(0,0,0,.12); cursor:pointer;
        background:${bg}; transition:transform .1s; padding:0;`;
      if (label) b.innerHTML = label;
      b.addEventListener('pointerdown', () => {
        Sound.play('tap');
        tool = value;
        [...palette.children].forEach(c => c.style.transform = '');
        b.style.transform = 'scale(1.25)';
      });
      palette.appendChild(b);
      return b;
    }
    COLORS.forEach(c => makeSwatch(c, c));
    makeSwatch('conic-gradient(#ff5252,#ffa726,#ffee58,#66bb6a,#4fc3f7,#ab47bc,#ff5252)', 'rainbow');
    makeSwatch('#fff8e1', 'glitter', `<span style="display:block; width:70%; height:70%; margin:15% auto;">${Art.particles.sparkle}</span>`);
    palette.children[7].dispatchEvent(new Event('pointerdown')); // Pink vorauswählen

    /* Galerie: fertige Bilder als kleine Fotos */
    const galleryEl = stage.querySelector('#eh-gallery');
    function saveToGallery() {
      try {
        const thumb = document.createElement('canvas');
        thumb.width = thumb.height = 512;
        thumb.getContext('2d').drawImage(canvas, 0, 0, 512, 512);
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
        mini.style.cssText = `width:clamp(54px,8vw,80px); aspect-ratio:1; background:#fff;
          border:3px solid #f48fb1; border-radius:12px; padding:2px; cursor:pointer; overflow:hidden;`;
        mini.innerHTML = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
        mini.addEventListener('pointerdown', () => {
          Sound.play('pop');
          const li = new Image();
          li.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, SIZE, SIZE);
            ctx.drawImage(li, 0, 0, SIZE, SIZE);
            starGiven = true; // geladenes Bild gibt keinen neuen Stern
            updateProgress();
          };
          li.src = dataUrl;
        });
        galleryEl.appendChild(mini);
      });
    }
    renderGallery();

    /* Neues Bild */
    stage.querySelector('#eh-new').addEventListener('pointerdown', () => {
      if (!ready) return;
      Sound.play('whoosh');
      if (coloredFraction() > 0.3 && !starGiven) saveToGallery(); // angefangenes Werk nicht verlieren
      resetCanvas();
    });

    return () => {
      window.removeEventListener('pointerup', stopGlitter);
    };
  }
};
