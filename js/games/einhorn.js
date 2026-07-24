/* Einhorn anmalen: Farbe antippen, dann Fläche antippen (Tap-to-Fill).
   Extra: Glitzer-Pinsel und Regenbogenfarbe. Fertige Bilder landen in
   einer kleinen Galerie. Alles ausgemalt = 1 Stern. */
(window.GameModules = window.GameModules || {}).einhorn = {
  title: 'Einhorn anmalen',
  icon: '🦄',
  tileClass: 'tile-einhorn',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #fce4ec 0%, #f8bbd0 100%)';

    const COLORS = {
      rot:     '#ff5252', orange:  '#ffa726', gelb:   '#ffee58',
      gruen:   '#66bb6a', hellblau:'#4fc3f7', blau:   '#5c6bc0',
      lila:    '#ab47bc', pink:    '#f48fb1', braun:  '#8d6e63',
      weiss:   '#ffffff'
    };
    const REGIONS = ['koerper', 'kopf', 'beine', 'hufe', 'maehne1', 'maehne2', 'maehne3', 'schweif', 'horn', 'fluegel'];
    const DEFAULT_FILL = '#f2f2f2';

    let fills = {};          // region -> Farbwert oder 'rainbow'
    let tool = COLORS.pink;  // aktuelle Farbe oder 'glitter'
    let starGiven = false;

    function fillValue(v, gradId) {
      return v === 'rainbow' ? `url(#${gradId})` : (v || DEFAULT_FILL);
    }

    /* Das Einhorn als SVG – gleiche Vorlage für Malbild und Galerie-Minis */
    function svgMarkup(f, gradId) {
      const g = r => fillValue(f[r], gradId);
      const S = 'stroke="#7a5f6e" stroke-width="3" stroke-linejoin="round"';
      return `
      <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff5252"/><stop offset="20%" stop-color="#ffa726"/>
            <stop offset="40%" stop-color="#ffee58"/><stop offset="60%" stop-color="#66bb6a"/>
            <stop offset="80%" stop-color="#4fc3f7"/><stop offset="100%" stop-color="#ab47bc"/>
          </linearGradient>
        </defs>
        <ellipse cx="210" cy="300" rx="150" ry="12" fill="rgba(0,0,0,.08)"/>
        <!-- Schweif -->
        <path data-region="schweif" fill="${g('schweif')}" ${S}
          d="M120 160 C 75 140, 60 190, 85 215 C 60 220, 70 260, 100 250 C 90 275, 125 280, 135 255 C 140 230, 135 190, 130 170 Z"/>
        <!-- Beine -->
        <g data-region="beine" fill="${g('beine')}" ${S}>
          <rect x="150" y="215" width="22" height="70" rx="10"/>
          <rect x="188" y="222" width="22" height="66" rx="10"/>
          <rect x="232" y="222" width="22" height="66" rx="10"/>
          <rect x="268" y="215" width="22" height="70" rx="10"/>
        </g>
        <!-- Hufe -->
        <g data-region="hufe" fill="${g('hufe')}" ${S}>
          <rect x="149" y="272" width="24" height="16" rx="7"/>
          <rect x="187" y="275" width="24" height="16" rx="7"/>
          <rect x="231" y="275" width="24" height="16" rx="7"/>
          <rect x="267" y="272" width="24" height="16" rx="7"/>
        </g>
        <!-- Körper -->
        <ellipse data-region="koerper" cx="215" cy="185" rx="88" ry="56" fill="${g('koerper')}" ${S}/>
        <!-- Flügel -->
        <path data-region="fluegel" fill="${g('fluegel')}" ${S}
          d="M205 150 C 170 110, 120 115, 118 145 C 140 142, 150 148, 148 158 C 165 152, 178 158, 176 168 C 190 164, 202 168, 205 178 Z"/>
        <!-- Hals + Kopf -->
        <path data-region="kopf" fill="${g('kopf')}" ${S}
          d="M270 160 C 275 120, 285 95, 305 82 C 330 66, 355 72, 362 88 C 368 100, 362 108, 352 112 L 356 124 C 358 132, 350 140, 340 138 C 330 152, 318 160, 300 170 C 290 178, 275 175, 270 160 Z"/>
        <!-- Mähne -->
        <path data-region="maehne1" fill="${g('maehne1')}" ${S} d="M300 78 C 285 60, 260 62, 258 82 C 256 98, 272 108, 284 100 C 294 94, 300 88, 300 78 Z"/>
        <path data-region="maehne2" fill="${g('maehne2')}" ${S} d="M272 100 C 252 90, 235 100, 240 118 C 244 133, 264 136, 272 124 C 278 116, 276 106, 272 100 Z"/>
        <path data-region="maehne3" fill="${g('maehne3')}" ${S} d="M252 128 C 232 122, 220 136, 228 152 C 234 164, 254 164, 258 150 C 261 141, 258 132, 252 128 Z"/>
        <!-- Horn -->
        <polygon data-region="horn" points="330,70 348,18 352,72" fill="${g('horn')}" ${S}/>
        <!-- Gesicht (fest) -->
        <circle cx="330" cy="95" r="5" fill="#4a3540"/>
        <circle cx="332" cy="93" r="1.6" fill="#fff"/>
        <ellipse cx="318" cy="112" rx="7" ry="5" fill="rgba(244,143,177,.55)"/>
        <path d="M350 100 C 354 103, 354 107, 350 109" stroke="#4a3540" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`;
    }

    /* Layout: links Galerie, Mitte Bild, unten Palette */
    stage.innerHTML += `
      <div id="eh-canvas" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-54%);
        width:min(78vw, 62vh * 1.31); aspect-ratio:420/320; background:#fff; border-radius:24px;
        box-shadow:0 6px 20px rgba(0,0,0,.18); padding:8px; touch-action:none;"></div>
      <div id="eh-palette" style="position:absolute; left:50%; bottom:8px; transform:translateX(-50%);
        display:flex; gap:10px; background:rgba(255,255,255,.92); padding:10px 14px; border-radius:40px;
        box-shadow:0 4px 10px rgba(0,0,0,.2); z-index:30; max-width:96vw; flex-wrap:wrap; justify-content:center;"></div>
      <div id="eh-gallery" style="position:absolute; left:8px; top:50%; transform:translateY(-50%);
        display:flex; flex-direction:column; gap:8px; z-index:30;"></div>
      <button id="eh-new" class="btn-round" style="position:absolute; right:12px; bottom:14px; z-index:30;">🔄</button>`;

    const canvas = stage.querySelector('#eh-canvas');
    const palette = stage.querySelector('#eh-palette');
    const galleryEl = stage.querySelector('#eh-gallery');

    function renderUnicorn() {
      canvas.innerHTML = svgMarkup(fills, 'rbg-main');
    }
    renderUnicorn();

    function updateProgress() {
      const done = REGIONS.filter(r => fills[r]).length;
      api.setProgress(`🎨 ${done} / ${REGIONS.length}`);
    }
    updateProgress();

    /* Palette aufbauen */
    function makeSwatch(bg, value, label) {
      const b = document.createElement('button');
      b.style.cssText = `width:clamp(40px,6vw,56px); height:clamp(40px,6vw,56px); border-radius:50%;
        border:4px solid #fff; outline:3px solid rgba(0,0,0,.12); cursor:pointer;
        background:${bg}; font-size:24px; transition:transform .1s;`;
      if (label) b.textContent = label;
      b.addEventListener('pointerdown', () => {
        Sound.play('tap');
        tool = value;
        [...palette.children].forEach(c => c.style.transform = '');
        b.style.transform = 'scale(1.25)';
      });
      palette.appendChild(b);
      return b;
    }
    Object.values(COLORS).forEach(c => makeSwatch(c, c));
    makeSwatch('conic-gradient(#ff5252,#ffa726,#ffee58,#66bb6a,#4fc3f7,#ab47bc,#ff5252)', 'rainbow');
    const glitterBtn = makeSwatch('#fff8e1', 'glitter', '✨');
    palette.children[7].dispatchEvent(new Event('pointerdown')); // Pink vorauswählen

    /* Malen: Tap-to-Fill bzw. Glitzer streuen */
    function paintAt(e) {
      const target = e.target.closest('[data-region]');
      if (tool === 'glitter') {
        const r = stage.getBoundingClientRect();
        Sound.play('sparkle');
        api.burst(e.clientX - r.left, e.clientY - r.top, ['✨', '💖', '⭐'], 5, 20);
        return;
      }
      if (!target) return;
      const region = target.getAttribute('data-region');
      Sound.play('pop');
      fills[region] = tool;
      renderUnicorn();
      updateProgress();
      const done = REGIONS.every(r => fills[r]);
      if (done && !starGiven) {
        starGiven = true;
        Sound.play('yay');
        saveToGallery();
        api.awardStar();
      }
    }
    canvas.addEventListener('pointerdown', paintAt);
    let glitterDrag = false;
    canvas.addEventListener('pointerdown', () => { glitterDrag = tool === 'glitter'; });
    canvas.addEventListener('pointermove', (e) => {
      if (glitterDrag && tool === 'glitter' && Math.random() < 0.35) paintAt(e);
    });
    window.addEventListener('pointerup', stopGlitter);
    function stopGlitter() { glitterDrag = false; }

    /* Galerie */
    function saveToGallery() {
      const gallery = Storage.get('einhorn.gallery', []);
      gallery.unshift({ ...fills });
      Storage.set('einhorn.gallery', gallery.slice(0, 5));
      renderGallery();
    }
    function renderGallery() {
      const gallery = Storage.get('einhorn.gallery', []);
      galleryEl.innerHTML = '';
      gallery.forEach((f, i) => {
        const mini = document.createElement('button');
        mini.style.cssText = `width:clamp(54px,8vw,80px); aspect-ratio:420/320; background:#fff;
          border:3px solid #f48fb1; border-radius:12px; padding:2px; cursor:pointer; overflow:hidden;`;
        mini.innerHTML = svgMarkup(f, 'rbg-mini' + i);
        mini.addEventListener('pointerdown', () => {
          Sound.play('pop');
          fills = { ...f };
          starGiven = true; // geladenes Bild gibt keinen neuen Stern
          renderUnicorn();
          updateProgress();
        });
        galleryEl.appendChild(mini);
      });
    }
    renderGallery();

    /* Neues Bild */
    stage.querySelector('#eh-new').addEventListener('pointerdown', () => {
      Sound.play('whoosh');
      const hadPaint = Object.keys(fills).length > 2;
      if (hadPaint && !starGiven) saveToGallery(); // angefangenes Werk nicht verlieren
      fills = {};
      starGiven = false;
      renderUnicorn();
      updateProgress();
    });

    return () => {
      window.removeEventListener('pointerup', stopGlitter);
    };
  }
};
