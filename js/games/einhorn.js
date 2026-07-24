/* Einhorn anmalen: Farbe antippen, dann Fläche antippen (Tap-to-Fill).
   Extra: Glitzer-Pinsel und Regenbogenfarbe. Fertige Bilder landen in
   einer kleinen Galerie. Alles ausgemalt = 1 Stern. */
(window.GameModules = window.GameModules || {}).einhorn = {
  title: 'Einhorn anmalen',
  tileClass: 'tile-einhorn',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #ffd9ec 0%, #f8bbd0 100%)';
    stage.innerHTML = `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:0;">
        <div style="position:absolute; top:5%; width:clamp(80px,12vw,140px); aspect-ratio:16/9; opacity:.8; animation:float-cloud 55s linear infinite;">${Art.cloud()}</div>
        <div style="position:absolute; top:64%; width:clamp(60px,9vw,110px); aspect-ratio:16/9; opacity:.6; animation:float-cloud 75s linear infinite; animation-delay:-40s;">${Art.cloud()}</div>
      </div>`;

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

    /* Das Einhorn als SVG (Chibi-Stil: großer Kopf, großes Auge, fließende Mähne)
       – gleiche Vorlage für Malbild und Galerie-Minis */
    function svgMarkup(f, gradId) {
      const g = r => fillValue(f[r], gradId);
      const S = 'stroke="#7a5f6e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
      return `
      <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff5252"/><stop offset="20%" stop-color="#ffa726"/>
            <stop offset="40%" stop-color="#ffee58"/><stop offset="60%" stop-color="#66bb6a"/>
            <stop offset="80%" stop-color="#4fc3f7"/><stop offset="100%" stop-color="#ab47bc"/>
          </linearGradient>
        </defs>
        <!-- Deko-Sternchen -->
        <path d="M52 44 L56 56 L68 60 L56 64 L52 76 L48 64 L36 60 L48 56 Z" fill="#ffd93b" opacity=".75"/>
        <path d="M378 200 L381 209 L390 212 L381 215 L378 224 L375 215 L366 212 L375 209 Z" fill="#ff8fc7" opacity=".75"/>
        <ellipse cx="195" cy="306" rx="135" ry="10" fill="rgba(0,0,0,.08)"/>
        <!-- Schweif: fließende Locken -->
        <path data-region="schweif" fill="${g('schweif')}" ${S}
          d="M108 176 C 70 160, 38 172, 42 200 C 20 208, 26 240, 54 240 C 40 258, 66 274, 86 260 C 96 252, 104 234, 106 218 C 108 204, 110 188, 108 176 Z"/>
        <!-- Beine -->
        <g data-region="beine" fill="${g('beine')}" ${S}>
          <rect x="102" y="232" width="26" height="62" rx="13"/>
          <rect x="146" y="238" width="26" height="58" rx="13"/>
          <rect x="196" y="238" width="26" height="58" rx="13"/>
          <rect x="238" y="232" width="26" height="62" rx="13"/>
        </g>
        <!-- Hufe -->
        <g data-region="hufe" fill="${g('hufe')}" ${S}>
          <rect x="101" y="276" width="28" height="20" rx="9"/>
          <rect x="145" y="278" width="28" height="20" rx="9"/>
          <rect x="195" y="278" width="28" height="20" rx="9"/>
          <rect x="237" y="276" width="28" height="20" rx="9"/>
        </g>
        <!-- Körper -->
        <ellipse data-region="koerper" cx="188" cy="212" rx="90" ry="56" fill="${g('koerper')}" ${S}/>
        <!-- Flügel: drei weiche Federbögen -->
        <path data-region="fluegel" fill="${g('fluegel')}" ${S}
          d="M186 170 C 172 132, 130 120, 104 138 C 116 143, 121 151, 116 159 C 132 155, 141 162, 138 172 C 152 168, 161 175, 158 186 C 170 182, 180 178, 186 170 Z"/>
        <!-- Mähne hinten (fällt auf den Rücken) -->
        <path data-region="maehne3" fill="${g('maehne3')}" ${S}
          d="M234 138 C 200 140, 188 176, 218 194 C 236 204, 256 190, 248 168 C 243 154, 238 146, 234 138 Z"/>
        <path data-region="maehne2" fill="${g('maehne2')}" ${S}
          d="M252 84 C 214 76, 192 110, 218 142 C 232 158, 258 148, 254 124 C 252 108, 250 96, 252 84 Z"/>
        <!-- Horn (Basis liegt hinter dem Kopf) -->
        <polygon data-region="horn" points="294,48 310,2 326,50" fill="${g('horn')}" ${S}/>
        <!-- Kopf mit Ohren und Schnauze -->
        <g data-region="kopf" fill="${g('kopf')}" ${S}>
          <polygon points="262,66 272,30 290,60"/>
          <polygon points="316,58 336,28 346,62"/>
          <circle cx="295" cy="112" r="58"/>
          <ellipse cx="340" cy="140" rx="28" ry="21"/>
        </g>
        <!-- Stirnlocke (liegt über dem Kopf) -->
        <path data-region="maehne1" fill="${g('maehne1')}" ${S}
          d="M283 52 C 250 22, 210 42, 226 82 C 234 100, 262 100, 270 80 C 274 68, 280 60, 283 52 Z"/>
        <!-- Gesicht (fest) -->
        <path d="M300 34 L318 28 M305 18 L315 14" stroke="#7a5f6e" stroke-width="2.5" fill="none"/>
        <polygon points="270,58 275,42 284,56" fill="#ffc9de" opacity=".85"/>
        <polygon points="323,52 332,38 339,55" fill="#ffc9de" opacity=".85"/>
        <ellipse cx="302" cy="104" rx="12" ry="15" fill="#3c2e42"/>
        <circle cx="306" cy="98" r="4.5" fill="#ffffff"/>
        <circle cx="297" cy="110" r="2.2" fill="#ffffff"/>
        <path d="M313 90 L321 82 M316 99 L326 95 M316 107 L326 108" stroke="#3c2e42" stroke-width="2.5" fill="none"/>
        <ellipse cx="324" cy="132" rx="10" ry="6" fill="#ff9fc0" opacity=".6"/>
        <circle cx="348" cy="135" r="2.6" fill="#7a5f6e" opacity=".55"/>
        <path d="M338 152 Q 347 160 357 151" stroke="#7a5f6e" stroke-width="3" fill="none"/>
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
      <button id="eh-new" class="btn-round" style="position:absolute; right:12px; bottom:14px; z-index:30;"><span class="icon">${Art.reset()}</span></button>`;

    const canvas = stage.querySelector('#eh-canvas');
    const palette = stage.querySelector('#eh-palette');
    const galleryEl = stage.querySelector('#eh-gallery');

    function renderUnicorn() {
      canvas.innerHTML = svgMarkup(fills, 'rbg-main');
    }
    renderUnicorn();

    function updateProgress() {
      const done = REGIONS.filter(r => fills[r]).length;
      api.setProgress(`<span class="icon" style="width:1.2em; height:1.2em;">${Art.particles.sparkle}</span>&nbsp;${done} / ${REGIONS.length}`);
    }
    updateProgress();

    /* Palette aufbauen */
    function makeSwatch(bg, value, label) {
      const b = document.createElement('button');
      b.style.cssText = `width:clamp(40px,6vw,56px); height:clamp(40px,6vw,56px); border-radius:50%;
        border:4px solid #fff; outline:3px solid rgba(0,0,0,.12); cursor:pointer;
        background:${bg}; font-size:24px; transition:transform .1s;`;
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
    Object.values(COLORS).forEach(c => makeSwatch(c, c));
    makeSwatch('conic-gradient(#ff5252,#ffa726,#ffee58,#66bb6a,#4fc3f7,#ab47bc,#ff5252)', 'rainbow');
    const glitterBtn = makeSwatch('#fff8e1', 'glitter', `<span style="display:block; width:70%; height:70%; margin:15% auto;">${Art.particles.sparkle}</span>`);
    palette.children[7].dispatchEvent(new Event('pointerdown')); // Pink vorauswählen

    /* Malen: Tap-to-Fill bzw. Glitzer streuen */
    function paintAt(e) {
      const target = e.target.closest('[data-region]');
      if (tool === 'glitter') {
        const r = stage.getBoundingClientRect();
        Sound.play('sparkle');
        api.burst(e.clientX - r.left, e.clientY - r.top, ['sparkle', 'heart'], 5, 20);
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
