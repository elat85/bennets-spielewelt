/* Grafikbibliothek: alle Figuren, Objekte und Szenen als handgezeichnete SVGs
   in einem einheitlichen Cartoon-Stil (weiche Verläufe, runde dunkle Konturen).
   Jede Funktion liefert einen SVG-String; Größe bestimmt der Einbau-Kontext. */
const Art = (() => {
  const OUT = '#463a52';                 // gemeinsame Konturfarbe
  const S = `stroke="${OUT}" stroke-linejoin="round" stroke-linecap="round"`;
  let uid = 0;
  const id = p => p + (++uid);           // eindeutige Gradient-IDs

  const wrap = (vb, inner, extra = '') =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" ${extra} style="display:block; width:100%; height:100%; overflow:visible;">${inner}</svg>`;

  /* ---------- Himmel & Landschaft ---------- */

  function sun() {
    const g = id('sun');
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * Math.PI / 180;
      rays += `<line x1="${60 + Math.cos(a) * 42}" y1="${60 + Math.sin(a) * 42}"
        x2="${60 + Math.cos(a) * 56}" y2="${60 + Math.sin(a) * 56}"
        stroke="#ffc93c" stroke-width="7" stroke-linecap="round"/>`;
    }
    return wrap('0 0 120 120', `
      <defs><radialGradient id="${g}"><stop offset="55%" stop-color="#ffe266"/><stop offset="100%" stop-color="#ffc93c"/></radialGradient></defs>
      <circle cx="60" cy="60" r="55" fill="#ffe26622"/>
      ${rays}
      <circle cx="60" cy="60" r="34" fill="url(#${g})" stroke="#f5a623" stroke-width="4"/>
      <circle cx="50" cy="52" r="4" fill="#5a4a20"/><circle cx="70" cy="52" r="4" fill="#5a4a20"/>
      <path d="M48 66 Q60 76 72 66" stroke="#5a4a20" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="62" r="5" fill="#ffb3a0" opacity=".7"/><circle cx="78" cy="62" r="5" fill="#ffb3a0" opacity=".7"/>`);
  }

  function cloud() {
    return wrap('0 0 160 90', `
      <g fill="#ffffff">
        <ellipse cx="45" cy="60" rx="38" ry="24"/>
        <ellipse cx="85" cy="45" rx="42" ry="30"/>
        <ellipse cx="122" cy="62" rx="32" ry="21"/>
      </g>
      <ellipse cx="80" cy="72" rx="70" ry="12" fill="#dcedf7"/>`);
  }

  /* Weiche Hügelkette als Hintergrund-Layer (volle Breite, verzerrbar) */
  function hills(color, variant = 0) {
    const paths = [
      'M0 60 Q 90 10 190 45 T 400 35 L 400 100 L 0 100 Z',
      'M0 45 Q 120 80 230 40 T 400 55 L 400 100 L 0 100 Z',
      'M0 55 Q 70 25 160 55 T 320 45 Q 370 35 400 50 L 400 100 L 0 100 Z'
    ];
    return wrap('0 0 400 100', `<path d="${paths[variant % 3]}" fill="${color}"/>`, 'preserveAspectRatio="none"');
  }

  function grassTuft() {
    return wrap('0 0 60 40', `
      <g stroke="#47823a" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M30 38 L30 12"/><path d="M18 38 Q16 24 8 18"/><path d="M42 38 Q44 24 52 18"/>
        <path d="M24 38 Q20 26 20 16"/><path d="M36 38 Q40 26 40 16"/>
      </g>`);
  }

  function flowerSmall(petal = '#ff8fc7') {
    let petals = '';
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * Math.PI / 180;
      petals += `<ellipse cx="${30 + Math.cos(a) * 12}" cy="${22 + Math.sin(a) * 12}" rx="9" ry="7"
        fill="${petal}" transform="rotate(${i * 60} ${30 + Math.cos(a) * 12} ${22 + Math.sin(a) * 12})"/>`;
    }
    return wrap('0 0 60 60', `
      <line x1="30" y1="34" x2="30" y2="56" stroke="#47823a" stroke-width="4"/>
      ${petals}<circle cx="30" cy="22" r="8" fill="#ffd93b" stroke="#e8a000" stroke-width="2.5"/>`);
  }

  function tree() {
    const g = id('tree');
    return wrap('0 0 120 150', `
      <defs><radialGradient id="${g}" cx=".35" cy=".3"><stop offset="0%" stop-color="#8ed35f"/><stop offset="100%" stop-color="#59a03f"/></radialGradient></defs>
      <path d="M54 148 L54 96 Q48 88 44 78 L54 86 L52 66 L60 84 L68 62 L66 86 L76 74 Q72 90 66 96 L66 148 Z"
        fill="#8d6748" ${S} stroke-width="4"/>
      <circle cx="38" cy="62" r="30" fill="url(#${g})" ${S} stroke-width="4"/>
      <circle cx="82" cy="58" r="33" fill="url(#${g})" ${S} stroke-width="4"/>
      <circle cx="60" cy="36" r="30" fill="url(#${g})" ${S} stroke-width="4"/>
      <circle cx="48" cy="48" r="4" fill="#ff6b6b"/><circle cx="74" cy="44" r="4" fill="#ff6b6b"/><circle cx="60" cy="58" r="4" fill="#ff6b6b"/>`);
  }

  function pine() {
    return wrap('0 0 100 150', `
      <rect x="43" y="112" width="14" height="34" rx="6" fill="#8d6748" ${S} stroke-width="4"/>
      <path d="M50 6 L82 60 L64 58 L92 106 L8 106 L36 58 L18 60 Z" fill="#3e8f4e" ${S} stroke-width="4"/>
      <path d="M50 6 L70 40 L30 40 Z" fill="#57a862"/>`);
  }

  function bush() {
    return wrap('0 0 140 80', `
      <ellipse cx="40" cy="55" rx="36" ry="24" fill="#5aa53c"/>
      <ellipse cx="95" cy="50" rx="42" ry="28" fill="#6cb84a"/>
      <ellipse cx="70" cy="62" rx="40" ry="18" fill="#7ac74f"/>
      <circle cx="52" cy="48" r="4" fill="#ff8fc7"/><circle cx="96" cy="42" r="4" fill="#ffd93b"/><circle cx="76" cy="58" r="4" fill="#ff8fc7"/>`);
  }

  function fence() {
    let posts = '';
    for (let i = 0; i < 6; i++) {
      const x = 8 + i * 38;
      posts += `<rect x="${x}" y="14" width="14" height="52" rx="6" fill="#c89b6c" ${S} stroke-width="3.5"/>
        <path d="M${x} 18 L${x + 7} 8 L${x + 14} 18 Z" fill="#c89b6c" ${S} stroke-width="3.5"/>`;
    }
    return wrap('0 0 230 70', `
      <rect x="0" y="26" width="230" height="10" rx="5" fill="#b3855a" ${S} stroke-width="3"/>
      <rect x="0" y="46" width="230" height="10" rx="5" fill="#b3855a" ${S} stroke-width="3"/>
      ${posts}`);
  }

  function barn() {
    return wrap('0 0 160 130', `
      <path d="M14 58 L80 12 L146 58 L146 126 L14 126 Z" fill="#e05d4b" ${S} stroke-width="5"/>
      <path d="M6 62 L80 8 L154 62 L146 58 L80 16 L14 58 Z" fill="#a8433a" ${S} stroke-width="5"/>
      <rect x="56" y="76" width="48" height="50" rx="6" fill="#8d5a3b" ${S} stroke-width="4"/>
      <line x1="80" y1="78" x2="80" y2="124" stroke="${OUT}" stroke-width="4"/>
      <circle cx="80" cy="48" r="13" fill="#fff8e7" ${S} stroke-width="4"/>`);
  }

  function volcano() {
    return wrap('0 0 160 130', `
      <path d="M60 22 L100 22 L152 126 L8 126 Z" fill="#9a6a4f" ${S} stroke-width="5"/>
      <path d="M60 22 Q80 34 100 22 L112 46 Q80 60 48 46 Z" fill="#ff7043" ${S} stroke-width="5"/>
      <path d="M66 26 Q70 52 60 74" stroke="#ff7043" stroke-width="9" fill="none" stroke-linecap="round"/>
      <circle cx="72" cy="6" r="10" fill="#cfcfcf" opacity=".85"/><circle cx="90" cy="10" r="7" fill="#e2e2e2" opacity=".85"/>`);
  }

  function palm() {
    return wrap('0 0 130 150', `
      <path d="M60 146 Q54 100 64 58 L76 58 Q70 102 74 146 Z" fill="#a5784e" ${S} stroke-width="4"/>
      <g fill="#4da651" ${S} stroke-width="4">
        <path d="M70 58 Q40 30 10 40 Q36 58 68 64 Z"/>
        <path d="M70 58 Q100 30 124 42 Q96 60 72 64 Z"/>
        <path d="M70 58 Q60 22 34 14 Q52 44 66 60 Z"/>
        <path d="M70 58 Q84 24 108 18 Q90 48 74 60 Z"/>
      </g>
      <circle cx="62" cy="62" r="7" fill="#8d5a3b" ${S} stroke-width="3"/><circle cx="76" cy="64" r="7" fill="#8d5a3b" ${S} stroke-width="3"/>`);
  }

  /* Komplette Wiesen-Szene als Hintergrund-Layer für eine Stage */
  function meadowScene(opts = {}) {
    const { sunPos = 'right', extras = '' } = opts;
    const sunSide = sunPos === 'right' ? 'right:4%;' : 'left:4%;';
    return `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:0;">
        <div style="position:absolute; ${sunSide} top:3%; width:clamp(80px,12vw,130px); aspect-ratio:1;">${sun()}</div>
        <div style="position:absolute; top:6%; width:clamp(90px,14vw,160px); aspect-ratio:16/9; animation:float-cloud 48s linear infinite;">${cloud()}</div>
        <div style="position:absolute; top:16%; width:clamp(70px,10vw,120px); aspect-ratio:16/9; animation:float-cloud 70s linear infinite; animation-delay:-30s; opacity:.85;">${cloud()}</div>
        <div style="position:absolute; left:0; right:0; bottom:38%; height:26%;">${hills('#a8d878', 0)}</div>
        <div style="position:absolute; left:0; right:0; bottom:30%; height:22%;">${hills('#8cc95e', 1)}</div>
        ${extras}
        <div style="position:absolute; left:2%; bottom:26%; width:clamp(60px,8vw,110px); aspect-ratio:120/150;">${tree()}</div>
        <div style="position:absolute; right:1%; bottom:24%; width:clamp(70px,9vw,130px); aspect-ratio:140/80;">${bush()}</div>
        <div style="position:absolute; left:12%; bottom:6%; width:clamp(30px,4vw,54px); aspect-ratio:60/40; opacity:.9;">${grassTuft()}</div>
        <div style="position:absolute; right:16%; bottom:12%; width:clamp(30px,4vw,54px); aspect-ratio:60/40; opacity:.9;">${grassTuft()}</div>
        <div style="position:absolute; left:28%; bottom:3%; width:clamp(26px,3.5vw,48px); aspect-ratio:1;">${flowerSmall('#ff8fc7')}</div>
        <div style="position:absolute; right:30%; bottom:5%; width:clamp(26px,3.5vw,48px); aspect-ratio:1;">${flowerSmall('#ffb1e6')}</div>
      </div>`;
  }

  /* ---------- Figuren ---------- */

  function chicken() {
    const g = id('chick');
    return wrap('0 0 120 120', `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#ece5d3"/></linearGradient></defs>
      <g stroke="#e8912d" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M50 92 L50 106 M50 106 L42 112 M50 106 L58 112"/>
        <path d="M70 92 L70 106 M70 106 L62 112 M70 106 L78 112"/>
      </g>
      <path d="M88 52 Q112 40 108 62 Q104 78 88 74 Z" fill="#ece5d3" ${S} stroke-width="4"/>
      <ellipse cx="62" cy="70" rx="33" ry="27" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <path d="M28 22 Q26 10 36 16 Q38 6 46 14 Q52 6 54 18 L50 30 Z" fill="#ff6b6b" ${S} stroke-width="4"/>
      <circle cx="40" cy="40" r="21" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <path d="M20 40 L6 46 L21 50 Z" fill="#ffa229" ${S} stroke-width="4"/>
      <path d="M26 52 Q22 62 30 60 Q34 58 32 52 Z" fill="#ff6b6b" ${S} stroke-width="3.5"/>
      <g class="art-blink"><circle cx="36" cy="37" r="4.5" fill="#2d2233"/><circle cx="37.5" cy="35.5" r="1.6" fill="#fff"/></g>
      <g class="art-flap"><ellipse cx="68" cy="72" rx="15" ry="11" fill="#e3dbc6" ${S} stroke-width="4" transform="rotate(-15 68 72)"/></g>`);
  }

  function corn() {
    return wrap('0 0 60 60', `
      <ellipse cx="30" cy="34" rx="14" ry="20" fill="#ffd93b" stroke="#e8a000" stroke-width="3.5"/>
      <path d="M20 26 L40 26 M18 34 L42 34 M20 42 L40 42 M30 16 L30 52" stroke="#e8a000" stroke-width="2" opacity=".7"/>
      <path d="M30 14 Q18 4 10 12 Q20 18 28 16 Z" fill="#6cb84a" stroke="#47823a" stroke-width="3"/>
      <path d="M32 14 Q44 4 52 12 Q42 18 34 16 Z" fill="#7ac74f" stroke="#47823a" stroke-width="3"/>`);
  }

  function egg() {
    return wrap('0 0 60 70', `
      <path d="M30 6 C 14 6 8 30 8 42 C 8 58 18 66 30 66 C 42 66 52 58 52 42 C 52 30 46 6 30 6 Z"
        fill="#fff8e7" ${S} stroke-width="4"/>
      <ellipse cx="22" cy="26" rx="6" ry="10" fill="#ffffff" transform="rotate(-15 22 26)"/>`);
  }

  function dinoRex() {
    const g = id('rex');
    return wrap('0 0 140 140', `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#79c85e"/><stop offset="100%" stop-color="#4e9e3d"/></linearGradient></defs>
      <g class="art-tail"><path d="M96 78 Q128 70 136 88 Q118 90 100 94 Z" fill="url(#${g})" ${S} stroke-width="4.5"/></g>
      <g fill="#4e9e3d" ${S} stroke-width="4">
        <path d="M56 26 L64 12 L70 26 Z"/><path d="M74 28 L82 14 L88 30 Z"/><path d="M90 40 L100 30 L102 44 Z"/>
      </g>
      <ellipse cx="76" cy="86" rx="32" ry="28" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <rect x="56" y="102" width="17" height="30" rx="8" fill="#4e9e3d" ${S} stroke-width="4"/>
      <rect x="82" y="102" width="17" height="30" rx="8" fill="#4e9e3d" ${S} stroke-width="4"/>
      <ellipse cx="76" cy="94" rx="18" ry="15" fill="#cdeab0"/>
      <path d="M60 64 Q54 74 62 76 L70 70 Z" fill="#4e9e3d" ${S} stroke-width="4"/>
      <path d="M22 26 Q14 44 22 58 Q34 70 54 64 Q66 58 64 42 Q62 24 44 20 Q28 18 22 26 Z" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <path d="M20 48 L52 52 Q50 60 40 60 Q26 60 20 48 Z" fill="#3d7d30" ${S} stroke-width="4"/>
      <g fill="#ffffff" stroke="${OUT}" stroke-width="2">
        <path d="M26 51 L29 56 L32 51 Z"/><path d="M35 52 L38 57 L41 52 Z"/><path d="M44 53 L46 58 L49 53 Z"/>
      </g>
      <g class="art-blink"><circle cx="42" cy="34" r="6.5" fill="#fff"/><circle cx="43.5" cy="35" r="3.4" fill="#2d2233"/></g>
      <path d="M34 26 L48 24" stroke="${OUT}" stroke-width="3.5"/>
      <circle cx="26" cy="38" r="2.6" fill="#2d5c22"/>`);
  }

  function dinoBronto() {
    const g = id('bronto');
    return wrap('0 0 150 140', `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5fc3dd"/><stop offset="100%" stop-color="#3d95b8"/></linearGradient></defs>
      <g class="art-tail"><path d="M112 92 Q142 84 148 100 Q128 104 112 106 Z" fill="url(#${g})" ${S} stroke-width="4.5"/></g>
      <ellipse cx="84" cy="98" rx="36" ry="26" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <rect x="60" y="112" width="16" height="24" rx="8" fill="#3d95b8" ${S} stroke-width="4"/>
      <rect x="94" y="112" width="16" height="24" rx="8" fill="#3d95b8" ${S} stroke-width="4"/>
      <ellipse cx="84" cy="106" rx="20" ry="13" fill="#c8ecf4"/>
      <path d="M56 88 Q40 74 38 46 Q37 28 46 22" stroke="url(#${g})" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M56 88 Q40 74 38 46 Q37 28 46 22" stroke="${OUT}" stroke-width="27" fill="none" stroke-linecap="round" opacity="0"/>
      <ellipse cx="48" cy="20" rx="17" ry="13" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <g class="art-blink"><circle cx="42" cy="17" r="5" fill="#fff"/><circle cx="43" cy="18" r="2.6" fill="#2d2233"/></g>
      <path d="M36 26 Q42 31 50 29" stroke="${OUT}" stroke-width="3" fill="none"/>
      <circle cx="36" cy="24" r="3.4" fill="#ff9fc0" opacity=".8"/>`);
  }

  function dinoDragon() {
    const g = id('drag');
    return wrap('0 0 140 140', `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b98ae0"/><stop offset="100%" stop-color="#8a5cc4"/></linearGradient></defs>
      <g class="art-tail"><path d="M98 84 Q126 72 134 86 Q124 88 122 96 Q110 92 98 96 Z" fill="url(#${g})" ${S} stroke-width="4.5"/></g>
      <path d="M64 58 Q46 34 64 24 Q60 44 76 52 Z" fill="#ffb1e6" ${S} stroke-width="4"/>
      <ellipse cx="76" cy="88" rx="30" ry="27" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <rect x="58" y="104" width="16" height="28" rx="8" fill="#8a5cc4" ${S} stroke-width="4"/>
      <rect x="84" y="104" width="16" height="28" rx="8" fill="#8a5cc4" ${S} stroke-width="4"/>
      <ellipse cx="76" cy="96" rx="17" ry="13" fill="#ecd9fb"/>
      <g fill="#ffd93b" ${S} stroke-width="3.5"><path d="M30 16 L34 4 L40 16 Z"/><path d="M44 12 L50 2 L54 14 Z"/></g>
      <circle cx="44" cy="36" r="22" fill="url(#${g})" ${S} stroke-width="4.5"/>
      <ellipse cx="30" cy="44" rx="12" ry="9" fill="#c9a6ec" ${S} stroke-width="4"/>
      <circle cx="26" cy="42" r="2.4" fill="${OUT}"/><circle cx="33" cy="42" r="2.4" fill="${OUT}"/>
      <g class="art-blink"><circle cx="48" cy="30" r="6" fill="#fff"/><circle cx="49" cy="31" r="3.2" fill="#2d2233"/></g>
      <path d="M20 52 Q26 58 34 55" stroke="${OUT}" stroke-width="3" fill="none"/>`);
  }

  function kid(pose = 'stand') {
    const arms = {
      stand: `<path d="M46 66 Q34 76 32 88" ${A()}/><path d="M74 66 Q86 76 88 88" ${A()}/>`,
      jump:  `<path d="M46 64 Q30 52 26 40" ${A()}/><path d="M74 64 Q90 52 94 40" ${A()}/>`,
      sit:   `<path d="M46 66 Q36 76 34 86" ${A()}/><path d="M74 66 Q84 76 86 86" ${A()}/>`
    };
    const legs = {
      stand: `<path d="M52 96 L50 122" ${L()}/><path d="M68 96 L70 122" ${L()}/>
              <ellipse cx="48" cy="126" rx="9" ry="5" fill="#e05d4b" ${S} stroke-width="3"/>
              <ellipse cx="72" cy="126" rx="9" ry="5" fill="#e05d4b" ${S} stroke-width="3"/>`,
      jump:  `<path d="M52 96 Q44 108 48 118" ${L()}/><path d="M68 96 Q76 108 72 118" ${L()}/>
              <ellipse cx="47" cy="121" rx="9" ry="5" fill="#e05d4b" ${S} stroke-width="3"/>
              <ellipse cx="73" cy="121" rx="9" ry="5" fill="#e05d4b" ${S} stroke-width="3"/>`,
      sit:   `<path d="M52 94 Q52 106 66 110 L84 110" ${L()}/><path d="M68 94 Q70 104 82 106 L96 106" ${L()}/>
              <ellipse cx="90" cy="110" rx="9" ry="5" fill="#e05d4b" ${S} stroke-width="3"/>
              <ellipse cx="100" cy="106" rx="9" ry="5" fill="#e05d4b" ${S} stroke-width="3"/>`
    };
    function A() { return `stroke="#ffb84d" stroke-width="11" fill="none" stroke-linecap="round"`; }
    function L() { return `stroke="#4a72c4" stroke-width="13" fill="none" stroke-linecap="round"`; }
    return wrap('0 0 120 132', `
      ${legs[pose]}
      <path d="M44 62 Q60 54 76 62 L78 92 Q60 100 42 92 Z" fill="#ffb84d" ${S} stroke-width="4.5"/>
      <path d="M46 74 L74 74" stroke="#f5a623" stroke-width="3" opacity=".6"/>
      ${arms[pose]}
      <circle cx="60" cy="34" r="26" fill="#ffd8b5" ${S} stroke-width="4.5"/>
      <path d="M34 30 Q34 8 60 8 Q86 8 86 30 Q76 18 60 20 Q44 18 34 30 Z" fill="#7a4a2b" ${S} stroke-width="4"/>
      <g class="art-blink"><circle cx="50" cy="36" r="3.6" fill="#2d2233"/><circle cx="70" cy="36" r="3.6" fill="#2d2233"/></g>
      <path d="M52 46 Q60 52 68 46" stroke="#2d2233" stroke-width="3.5" fill="none"/>
      <circle cx="43" cy="43" r="4.5" fill="#ffb3a0" opacity=".8"/><circle cx="77" cy="43" r="4.5" fill="#ffb3a0" opacity=".8"/>`);
  }

  function plush(type) {
    const cfg = {
      teddy: { fur: '#c98d5f', inner: '#e8b58a',
        ears: `<circle cx="26" cy="22" r="13" fill="#c98d5f" ${S} stroke-width="4"/><circle cx="26" cy="22" r="6" fill="#e8b58a"/>
               <circle cx="84" cy="22" r="13" fill="#c98d5f" ${S} stroke-width="4"/><circle cx="84" cy="22" r="6" fill="#e8b58a"/>` },
      bunny: { fur: '#f2f2f2', inner: '#ffc9de',
        ears: `<ellipse cx="36" cy="10" rx="10" ry="24" fill="#f2f2f2" ${S} stroke-width="4" transform="rotate(-12 36 10)"/>
               <ellipse cx="36" cy="12" rx="4.5" ry="16" fill="#ffc9de" transform="rotate(-12 36 12)"/>
               <ellipse cx="74" cy="10" rx="10" ry="24" fill="#f2f2f2" ${S} stroke-width="4" transform="rotate(12 74 10)"/>
               <ellipse cx="74" cy="12" rx="4.5" ry="16" fill="#ffc9de" transform="rotate(12 74 12)"/>` },
      pig: { fur: '#ffa8c5', inner: '#ff8fb3',
        ears: `<path d="M22 26 L18 8 L40 16 Z" fill="#ffa8c5" ${S} stroke-width="4"/>
               <path d="M88 26 L92 8 L70 16 Z" fill="#ffa8c5" ${S} stroke-width="4"/>` },
      koala: { fur: '#a8b2bd', inner: '#d7dde3',
        ears: `<circle cx="20" cy="26" r="15" fill="#a8b2bd" ${S} stroke-width="4"/><circle cx="20" cy="26" r="8" fill="#d7dde3"/>
               <circle cx="90" cy="26" r="15" fill="#a8b2bd" ${S} stroke-width="4"/><circle cx="90" cy="26" r="8" fill="#d7dde3"/>` }
    }[type] || {};
    const face = type === 'pig'
      ? `<ellipse cx="55" cy="50" rx="13" ry="9" fill="#ff8fb3" ${S} stroke-width="3.5"/>
         <circle cx="50" cy="50" r="2.4" fill="${OUT}"/><circle cx="60" cy="50" r="2.4" fill="${OUT}"/>`
      : `<ellipse cx="55" cy="52" rx="10" ry="7" fill="${cfg.inner}"/>
         <ellipse cx="55" cy="48" rx="4.5" ry="3.5" fill="${OUT}"/>
         <path d="M48 58 Q55 62 62 58" stroke="${OUT}" stroke-width="3" fill="none"/>`;
    return wrap('0 0 110 130', `
      ${cfg.ears}
      <ellipse cx="55" cy="102" rx="30" ry="24" fill="${cfg.fur}" ${S} stroke-width="4.5"/>
      <ellipse cx="55" cy="108" rx="16" ry="12" fill="${cfg.inner}"/>
      <circle cx="55" cy="44" r="32" fill="${cfg.fur}" ${S} stroke-width="4.5"/>
      <circle cx="42" cy="38" r="4" fill="#2d2233"/><circle cx="68" cy="38" r="4" fill="#2d2233"/>
      <circle cx="43.5" cy="36.5" r="1.5" fill="#fff"/><circle cx="69.5" cy="36.5" r="1.5" fill="#fff"/>
      ${face}
      <circle cx="34" cy="48" r="5" fill="#ffb3a0" opacity=".65"/><circle cx="76" cy="48" r="5" fill="#ffb3a0" opacity=".65"/>`);
  }

  function pillow(color = '#b39ddb') {
    const g = id('pil');
    return wrap('0 0 120 90', `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="#8a6cc4"/></linearGradient></defs>
      <path d="M12 18 Q60 6 108 18 Q116 45 108 72 Q60 84 12 72 Q4 45 12 18 Z" fill="url(#${g})" ${S} stroke-width="5"/>
      <path d="M12 18 Q60 6 108 18" fill="none" stroke="#ffffff55" stroke-width="6"/>
      <path d="M22 28 Q60 20 98 28 M22 62 Q60 70 98 62" stroke="#ffffff44" stroke-width="4" fill="none"/>
      <circle cx="60" cy="45" r="6" fill="#8a6cc4" stroke="${OUT}" stroke-width="3"/>`);
  }

  /* ---------- Essen ---------- */

  const foods = {
    keule: () => wrap('0 0 70 70', `
      <circle cx="14" cy="52" r="8" fill="#fff8e7" ${S} stroke-width="3.5"/>
      <circle cx="24" cy="60" r="8" fill="#fff8e7" ${S} stroke-width="3.5"/>
      <path d="M22 50 Q18 30 34 18 Q52 6 62 20 Q72 34 58 46 Q46 58 30 56 Z" fill="#c46a3f" ${S} stroke-width="4"/>
      <path d="M36 22 Q50 14 58 24" stroke="#e89a6b" stroke-width="5" fill="none"/>`),
    steak: () => wrap('0 0 70 70', `
      <path d="M10 34 Q10 16 32 16 Q62 16 60 36 Q58 54 34 54 Q10 54 10 34 Z" fill="#d9534f" ${S} stroke-width="4"/>
      <path d="M20 34 Q20 26 32 26 Q48 26 48 36 Q46 44 33 44 Q20 44 20 34 Z" fill="#f0857d"/>`),
    wurst: () => wrap('0 0 70 70', `
      <path d="M12 46 Q10 24 32 18 Q56 12 60 32" stroke="#b55a38" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M16 42 Q16 28 34 24 Q50 20 55 32" stroke="#d97b52" stroke-width="6" fill="none" stroke-linecap="round"/>`),
    brokkoli: () => wrap('0 0 70 70', `
      <rect x="30" y="38" width="10" height="22" rx="5" fill="#a3c96e" ${S} stroke-width="3.5"/>
      <circle cx="22" cy="30" r="13" fill="#3e8f4e" ${S} stroke-width="3.5"/>
      <circle cx="48" cy="30" r="13" fill="#3e8f4e" ${S} stroke-width="3.5"/>
      <circle cx="35" cy="18" r="13" fill="#57a862" ${S} stroke-width="3.5"/>`),
    karotte: () => wrap('0 0 70 70', `
      <path d="M24 24 L46 46 L18 60 Z" fill="#ff9f43" ${S} stroke-width="4" transform="rotate(-8 32 42)"/>
      <path d="M42 22 Q46 8 56 6 M46 26 Q56 18 66 20 M40 28 Q40 14 32 10" stroke="#57a862" stroke-width="5" fill="none"/>`),
    banane: () => wrap('0 0 70 70', `
      <path d="M14 22 Q18 52 48 56 Q60 57 62 48 Q58 50 50 48 Q26 44 22 20 Q20 14 14 22 Z" fill="#ffd93b" ${S} stroke-width="4"/>
      <rect x="12" y="14" width="8" height="8" rx="3" fill="#8d6748"/>`),
    apfel: () => wrap('0 0 70 70', `
      <path d="M35 22 Q18 14 12 32 Q8 52 26 58 Q35 61 44 58 Q62 52 58 32 Q52 14 35 22 Z" fill="#ff6b6b" ${S} stroke-width="4"/>
      <path d="M35 20 Q34 12 38 8" stroke="#8d6748" stroke-width="4" fill="none"/>
      <path d="M38 14 Q48 6 54 14 Q46 20 38 14 Z" fill="#57a862" ${S} stroke-width="3"/>
      <ellipse cx="26" cy="32" rx="5" ry="8" fill="#ffb3a0" opacity=".7" transform="rotate(-18 26 32)"/>`),
    salat: () => wrap('0 0 70 70', `
      <path d="M12 40 Q6 22 22 24 Q22 10 36 16 Q46 6 52 18 Q66 16 62 32 Q70 44 54 50 Q48 60 34 56 Q18 58 14 46 Q12 44 12 40 Z"
        fill="#7ac74f" ${S} stroke-width="4"/>
      <path d="M24 40 Q34 30 48 38 M28 30 Q36 40 30 48" stroke="#47823a" stroke-width="3.5" fill="none" opacity=".7"/>`)
  };

  /* ---------- Garten-Objekte ---------- */

  const garden = {
    tulpe: () => wrap('0 0 90 120', `
      <path d="M45 60 L45 112" stroke="#47823a" stroke-width="6"/>
      <path d="M45 86 Q28 80 22 66 Q38 68 45 78 Z" fill="#5aa53c" ${S} stroke-width="3.5"/>
      <path d="M45 96 Q62 90 68 76 Q52 78 45 88 Z" fill="#5aa53c" ${S} stroke-width="3.5"/>
      <path d="M26 34 Q26 14 36 20 Q40 10 45 20 Q50 10 54 20 Q64 14 64 34 Q64 56 45 58 Q26 56 26 34 Z" fill="#ff6fa5" ${S} stroke-width="4"/>`),
    sonnenblume: () => {
      let p = '';
      for (let i = 0; i < 12; i++) p += `<ellipse cx="45" cy="12" rx="8" ry="16" fill="#ffd93b" stroke="#e8a000" stroke-width="2.5" transform="rotate(${i * 30} 45 40)"/>`;
      return wrap('0 0 90 130', `
        <path d="M45 66 L45 124" stroke="#47823a" stroke-width="6"/>
        <path d="M45 100 Q26 94 20 80 Q38 82 45 92 Z" fill="#5aa53c" ${S} stroke-width="3.5"/>
        ${p}<circle cx="45" cy="40" r="16" fill="#8d5a3b" ${S} stroke-width="3.5"/>
        <circle cx="40" cy="36" r="2" fill="#6b4028"/><circle cx="50" cy="38" r="2" fill="#6b4028"/><circle cx="44" cy="45" r="2" fill="#6b4028"/>`);
    },
    gaensebluemchen: () => {
      let p = '';
      for (let i = 0; i < 8; i++) p += `<ellipse cx="45" cy="20" rx="9" ry="15" fill="#ffffff" stroke="#d8d2c2" stroke-width="2.5" transform="rotate(${i * 45} 45 42)"/>`;
      return wrap('0 0 90 120', `
        <path d="M45 62 L45 114" stroke="#47823a" stroke-width="6"/>
        ${p}<circle cx="45" cy="42" r="13" fill="#ffd93b" stroke="#e8a000" stroke-width="3"/>`);
    },
    baum: tree,
    tanne: pine,
    pilz: () => wrap('0 0 90 110', `
      <path d="M32 62 Q30 96 38 102 L54 102 Q60 96 58 62 Z" fill="#fff3dd" ${S} stroke-width="4"/>
      <path d="M8 60 Q8 18 45 18 Q82 18 82 60 Q64 66 45 66 Q26 66 8 60 Z" fill="#e05d4b" ${S} stroke-width="4.5"/>
      <circle cx="28" cy="42" r="7" fill="#fff3dd"/><circle cx="56" cy="34" r="8" fill="#fff3dd"/><circle cx="66" cy="52" r="5" fill="#fff3dd"/>`),
    brunnen: () => wrap('0 0 110 120', `
      <path d="M20 96 Q55 88 90 96 L86 114 Q55 120 24 114 Z" fill="#9aa7b8" ${S} stroke-width="4"/>
      <path d="M28 96 Q55 92 82 96 L80 92 Q55 86 30 92 Z" fill="#68d8f0"/>
      <rect x="49" y="52" width="12" height="40" rx="5" fill="#8494a8" ${S} stroke-width="4"/>
      <ellipse cx="55" cy="50" rx="16" ry="7" fill="#9aa7b8" ${S} stroke-width="4"/>
      <path d="M42 48 Q30 60 32 84 M68 48 Q80 60 78 84" stroke="#68d8f0" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="55" cy="38" r="7" fill="#68d8f0" ${S} stroke-width="3"/>`),
    ente: () => wrap('0 0 100 90', `
      <ellipse cx="52" cy="58" rx="32" ry="22" fill="#ffd93b" stroke="#e8a000" stroke-width="4"/>
      <path d="M78 50 Q94 42 92 58 Q86 64 76 60 Z" fill="#ffce23" stroke="#e8a000" stroke-width="3.5"/>
      <circle cx="32" cy="32" r="17" fill="#ffd93b" stroke="#e8a000" stroke-width="4"/>
      <path d="M16 32 L4 36 L17 40 Z" fill="#ff9f43" ${S} stroke-width="3.5"/>
      <circle cx="29" cy="29" r="3.5" fill="#2d2233"/>
      <ellipse cx="56" cy="60" rx="13" ry="9" fill="#ffce23" stroke="#e8a000" stroke-width="3" transform="rotate(-12 56 60)"/>`),
    schmetterling: () => wrap('0 0 100 90', `
      <g ${S} stroke-width="3.5">
        <path d="M46 44 Q16 14 10 34 Q6 50 42 52 Z" fill="#ff8fc7"/>
        <path d="M54 44 Q84 14 90 34 Q94 50 58 52 Z" fill="#ff8fc7"/>
        <path d="M46 50 Q20 66 26 76 Q34 84 46 58 Z" fill="#ffb1e6"/>
        <path d="M54 50 Q80 66 74 76 Q66 84 54 58 Z" fill="#ffb1e6"/>
      </g>
      <ellipse cx="50" cy="50" rx="6" ry="16" fill="#6b4b8a" ${S} stroke-width="3"/>
      <path d="M46 34 Q42 24 36 22 M54 34 Q58 24 64 22" stroke="${OUT}" stroke-width="2.5" fill="none"/>
      <circle cx="36" cy="30" r="3" fill="#ffd93b"/><circle cx="64" cy="30" r="3" fill="#ffd93b"/>`),
    biene: () => wrap('0 0 90 80', `
      <ellipse cx="34" cy="26" rx="13" ry="9" fill="#cfe9f5" stroke="#9cc4d8" stroke-width="3" transform="rotate(-25 34 26)"/>
      <ellipse cx="56" cy="26" rx="13" ry="9" fill="#e2f2fa" stroke="#9cc4d8" stroke-width="3" transform="rotate(25 56 26)"/>
      <ellipse cx="45" cy="48" rx="26" ry="18" fill="#ffd93b" ${S} stroke-width="4"/>
      <path d="M36 32 Q34 48 36 64 M50 31 Q48 48 50 65" stroke="${OUT}" stroke-width="6"/>
      <circle cx="63" cy="42" r="3" fill="#2d2233"/>
      <path d="M68 52 L78 56" stroke="${OUT}" stroke-width="3.5"/>`),
    stein: () => wrap('0 0 100 70', `
      <path d="M14 56 Q6 34 26 24 Q40 12 60 20 Q84 22 88 42 Q92 58 72 62 Q40 68 14 56 Z" fill="#b0b8c2" ${S} stroke-width="4"/>
      <path d="M30 36 Q44 28 58 34" stroke="#8e98a5" stroke-width="4" fill="none"/><circle cx="68" cy="44" r="4" fill="#8e98a5"/>`),
    vogelhaus: () => wrap('0 0 90 130', `
      <rect x="41" y="70" width="8" height="56" rx="4" fill="#8d6748" ${S} stroke-width="3.5"/>
      <rect x="20" y="34" width="50" height="42" rx="6" fill="#e8b06c" ${S} stroke-width="4"/>
      <path d="M12 38 L45 10 L78 38 Z" fill="#e05d4b" ${S} stroke-width="4"/>
      <circle cx="45" cy="54" r="9" fill="#5a4632" ${S} stroke-width="3.5"/>
      <rect x="40" y="66" width="10" height="4" rx="2" fill="#8d6748"/>`)
  };

  /* ---------- Zimmer (Kissenschlacht) ---------- */

  function sofa() {
    const g = id('sofa');
    return wrap('0 0 220 130', `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f2a25c"/><stop offset="100%" stop-color="#dd8340"/></linearGradient></defs>
      <rect x="14" y="16" width="192" height="66" rx="18" fill="url(#${g})" ${S} stroke-width="5"/>
      <rect x="4" y="52" width="42" height="56" rx="14" fill="#e8924e" ${S} stroke-width="5"/>
      <rect x="174" y="52" width="42" height="56" rx="14" fill="#e8924e" ${S} stroke-width="5"/>
      <rect x="34" y="58" width="74" height="46" rx="10" fill="#f7b877" ${S} stroke-width="4"/>
      <rect x="112" y="58" width="74" height="46" rx="10" fill="#f7b877" ${S} stroke-width="4"/>
      <rect x="20" y="104" width="14" height="18" rx="5" fill="#8d6748" ${S} stroke-width="4"/>
      <rect x="186" y="104" width="14" height="18" rx="5" fill="#8d6748" ${S} stroke-width="4"/>`);
  }

  function bed() {
    return wrap('0 0 230 140', `
      <rect x="8" y="10" width="44" height="112" rx="12" fill="#a5784e" ${S} stroke-width="5"/>
      <rect x="16" y="70" width="206" height="44" rx="12" fill="#f2f2f2" ${S} stroke-width="5"/>
      <path d="M52 74 L222 74 L222 112 Q140 122 52 112 Z" fill="#68b8e8" ${S} stroke-width="5"/>
      <path d="M52 88 Q140 96 222 88" stroke="#4a9ad0" stroke-width="4" fill="none"/>
      <ellipse cx="40" cy="62" rx="22" ry="13" fill="#ffffff" ${S} stroke-width="4"/>
      <rect x="18" y="114" width="14" height="20" rx="5" fill="#8d6748" ${S} stroke-width="4"/>
      <rect x="200" y="114" width="14" height="20" rx="5" fill="#8d6748" ${S} stroke-width="4"/>`);
  }

  function chair() {
    return wrap('0 0 110 150', `
      <rect x="22" y="8" width="66" height="72" rx="14" fill="#68b8e8" ${S} stroke-width="5"/>
      <rect x="30" y="18" width="50" height="52" rx="10" fill="#8fd0f2"/>
      <rect x="14" y="74" width="82" height="26" rx="12" fill="#4a9ad0" ${S} stroke-width="5"/>
      <rect x="22" y="100" width="13" height="42" rx="6" fill="#a5784e" ${S} stroke-width="4"/>
      <rect x="75" y="100" width="13" height="42" rx="6" fill="#a5784e" ${S} stroke-width="4"/>`);
  }

  function toybox() {
    return wrap('0 0 130 100', `
      <rect x="8" y="30" width="114" height="64" rx="10" fill="#e8b06c" ${S} stroke-width="5"/>
      <rect x="4" y="16" width="122" height="24" rx="9" fill="#d89a52" ${S} stroke-width="5"/>
      <path d="M52 16 Q56 4 65 4 Q74 4 78 16" stroke="#8d6748" stroke-width="6" fill="none"/>
      <circle cx="38" cy="62" r="8" fill="#ff6b6b"/><rect x="60" y="54" width="16" height="16" rx="4" fill="#68b8e8"/>
      <path d="M96 70 L103 56 L110 70 Z" fill="#7ac74f"/>`);
  }

  function basket() {
    return wrap('0 0 120 90', `
      <path d="M10 24 L110 24 L98 82 Q60 90 22 82 Z" fill="#d9a866" ${S} stroke-width="5"/>
      <path d="M16 40 L104 40 M20 58 L100 58 M34 26 L38 84 M60 26 L60 86 M86 26 L82 84" stroke="#b3855a" stroke-width="4"/>
      <rect x="6" y="16" width="108" height="14" rx="7" fill="#c89b6c" ${S} stroke-width="4.5"/>`);
  }

  function windowArt() {
    return wrap('0 0 140 160', `
      <rect x="6" y="6" width="128" height="148" rx="10" fill="#a5784e" ${S} stroke-width="5"/>
      <rect x="18" y="18" width="104" height="124" rx="4" fill="#aee3ff"/>
      <circle cx="44" cy="46" r="14" fill="#ffe266"/>
      <ellipse cx="86" cy="60" rx="22" ry="10" fill="#ffffff"/>
      <path d="M18 116 Q50 96 80 112 T 122 108 L122 142 L18 142 Z" fill="#8cc95e"/>
      <line x1="70" y1="18" x2="70" y2="142" stroke="#a5784e" stroke-width="7"/>
      <line x1="18" y1="80" x2="122" y2="80" stroke="#a5784e" stroke-width="7"/>
      <path d="M6 6 Q26 40 22 82 L6 82 Z" fill="#ffb1e6" ${S} stroke-width="4"/>
      <path d="M134 6 Q114 40 118 82 L134 82 Z" fill="#ffb1e6" ${S} stroke-width="4"/>`);
  }

  function picture() {
    return wrap('0 0 110 90', `
      <rect x="4" y="4" width="102" height="82" rx="8" fill="#e8b06c" ${S} stroke-width="5"/>
      <rect x="14" y="14" width="82" height="62" rx="4" fill="#fff8e7"/>
      <circle cx="34" cy="34" r="9" fill="#ffe266"/>
      <path d="M14 62 L38 42 L56 58 L74 38 L96 60 L96 76 L14 76 Z" fill="#8cc95e"/>
      <path d="M60 30 Q64 22 70 26 Q76 20 78 28" stroke="#68b8e8" stroke-width="3.5" fill="none"/>`);
  }

  /* ---------- UI-Icons ---------- */

  function star(filled = true) {
    return wrap('0 0 60 60', `
      <path d="M30 4 L37 22 L57 23 L41 35 L47 55 L30 43 L13 55 L19 35 L3 23 L23 22 Z"
        fill="${filled ? '#ffd93b' : '#ffffff44'}" stroke="${filled ? '#e8a000' : '#ffffff'}" stroke-width="3.5" stroke-linejoin="round"/>
      ${filled ? '<path d="M22 20 L28 10" stroke="#fff3b0" stroke-width="4" stroke-linecap="round"/>' : ''}`);
  }

  function home() {
    return wrap('0 0 60 60', `
      <path d="M6 30 L30 8 L54 30" fill="none" stroke="#e05d4b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13 28 L13 52 L47 52 L47 28" fill="#ffb84d" stroke="#e8912d" stroke-width="5" stroke-linejoin="round"/>
      <rect x="25" y="36" width="10" height="16" rx="3" fill="#8d5a3b"/>`);
  }

  function speaker(on = true) {
    return wrap('0 0 60 60', `
      <path d="M8 24 L18 24 L32 12 L32 48 L18 36 L8 36 Z" fill="#68b8e8" stroke="#3d85b8" stroke-width="4" stroke-linejoin="round"/>
      ${on
        ? `<path d="M40 22 Q46 30 40 38 M46 16 Q56 30 46 44" stroke="#3d85b8" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
        : `<path d="M40 22 L54 38 M54 22 L40 38" stroke="#e05d4b" stroke-width="5" stroke-linecap="round"/>`}`);
  }

  function trashcan() {
    return wrap('0 0 60 70', `
      <path d="M12 20 L48 20 L44 62 Q30 68 16 62 Z" fill="#9aa7b8" ${S} stroke-width="4"/>
      <rect x="8" y="12" width="44" height="10" rx="5" fill="#8494a8" ${S} stroke-width="4"/>
      <path d="M24 12 Q24 4 30 4 Q36 4 36 12" stroke="${OUT}" stroke-width="4" fill="none"/>
      <path d="M22 28 L24 54 M30 28 L30 54 M38 28 L36 54" stroke="#7c8896" stroke-width="4" stroke-linecap="round"/>`);
  }

  function album() {
    return wrap('0 0 60 60', `
      <path d="M10 10 Q10 6 14 6 L28 6 Q30 6 30 9 L30 52 Q30 49 27 49 L14 49 Q10 49 10 45 Z" fill="#68b8e8" stroke="#3d85b8" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M50 10 Q50 6 46 6 L32 6 Q30 6 30 9 L30 52 Q30 49 33 49 L46 49 Q50 49 50 45 Z" fill="#8fd0f2" stroke="#3d85b8" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M36 20 L38.5 26 L45 26.5 L40 30.5 L41.8 37 L36 33.5 L30.5 37 L32 30.5 L27 26.5 L33.5 26 Z" fill="#ffd93b" stroke="#e8a000" stroke-width="2" stroke-linejoin="round"/>
      <path d="M15 18 L25 18 M15 25 L25 25 M15 32 L23 32" stroke="#3d85b8" stroke-width="2.5" stroke-linecap="round"/>`);
  }

  function note(on = true) {
    return wrap('0 0 60 60', `
      <path d="M22 44 L22 14 L46 9 L46 38" stroke="${on ? '#7a55c8' : '#a8a0b8'}" stroke-width="5" fill="none" stroke-linejoin="round"/>
      <ellipse cx="16" cy="45" rx="8" ry="6.5" fill="${on ? '#7a55c8' : '#a8a0b8'}"/>
      <ellipse cx="40" cy="39" rx="8" ry="6.5" fill="${on ? '#9a76e0' : '#bcb4cc'}"/>
      ${on ? '' : `<path d="M8 8 L52 52" stroke="#e05d4b" stroke-width="5" stroke-linecap="round"/>`}`);
  }

  function reset() {
    return wrap('0 0 60 60', `
      <path d="M46 30 A16 16 0 1 1 38 16" fill="none" stroke="#68b8e8" stroke-width="7" stroke-linecap="round"/>
      <path d="M34 6 L46 16 L32 24 Z" fill="#68b8e8"/>`);
  }

  /* Mini-Einhorn (Kopf) für Menü-Kachel und Sticker */
  function unicornMini() {
    return wrap('0 0 120 120', `
      <polygon points="56,28 66,2 78,30" fill="#ffd93b" ${S} stroke-width="3.5"/>
      <path d="M62 20 L74 16 M64 11 L72 8" stroke="${OUT}" stroke-width="2"/>
      <polygon points="40,36 44,16 58,32" fill="#fdf6ff" ${S} stroke-width="3.5"/>
      <polygon points="80,30 92,14 96,36" fill="#fdf6ff" ${S} stroke-width="3.5"/>
      <polygon points="45,32 47,22 55,31" fill="#ffc9de"/>
      <polygon points="84,29 90,20 92,33" fill="#ffc9de"/>
      <path d="M52 30 C 30 16, 8 32, 22 54 C 28 64, 44 62, 46 50 Q 48 38 52 30 Z" fill="#ff8fc7" ${S} stroke-width="3.5"/>
      <path d="M40 54 C 18 56, 14 82, 36 90 C 50 94, 58 82, 52 70 Q 46 60 40 54 Z" fill="#c98ae0" ${S} stroke-width="3.5"/>
      <circle cx="70" cy="68" r="38" fill="#fdf6ff" ${S} stroke-width="4"/>
      <ellipse cx="98" cy="86" rx="17" ry="13" fill="#fdf6ff" ${S} stroke-width="3.5"/>
      <ellipse cx="74" cy="62" rx="8" ry="10" fill="#3c2e42"/>
      <circle cx="77" cy="58" r="3" fill="#fff"/><circle cx="71" cy="66" r="1.6" fill="#fff"/>
      <path d="M82 52 L88 46 M84 60 L92 57" stroke="#3c2e42" stroke-width="2" fill="none"/>
      <ellipse cx="88" cy="76" rx="7" ry="4.5" fill="#ff9fc0" opacity=".65"/>
      <path d="M96 92 Q102 97 109 91" stroke="#7a5f6e" stroke-width="2.5" fill="none"/>`);
  }

  /* Mini-Schaukel für die Menü-Kachel */
  function swingMini() {
    return wrap('0 0 120 120', `
      <path d="M14 110 L38 16 L60 16" stroke="#8d6748" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M106 110 L82 16 L60 16" stroke="#a5784e" stroke-width="8" fill="none" stroke-linecap="round"/>
      <line x1="48" y1="20" x2="42" y2="78" stroke="#6b4b3a" stroke-width="4"/>
      <line x1="76" y1="20" x2="82" y2="78" stroke="#6b4b3a" stroke-width="4"/>
      <rect x="34" y="76" width="56" height="12" rx="6" fill="#e05d4b" ${S} stroke-width="4"/>`);
  }

  /* Mini-Trampolin für die Menü-Kachel */
  function trampolineMini() {
    return wrap('0 0 120 120', `
      <ellipse cx="60" cy="86" rx="52" ry="16" fill="#38c8b0" stroke="#1e9a86" stroke-width="5"/>
      <ellipse cx="60" cy="82" rx="44" ry="11" fill="#5adcc6"/>
      <path d="M18 96 L14 116 M102 96 L106 116 M42 100 L40 116 M78 100 L80 116" stroke="#546a78" stroke-width="6" stroke-linecap="round"/>
      <path d="M60 54 Q56 34 60 18 M60 18 L50 30 M60 18 L70 30" stroke="#ff6b6b" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  }

  /* Partikel */
  const particles = {
    heart:   `<svg viewBox="0 0 40 40" style="width:100%;height:100%;"><path d="M20 34 Q4 22 4 12 Q4 2 13 4 Q18 5 20 11 Q22 5 27 4 Q36 2 36 12 Q36 22 20 34 Z" fill="#ff6b6b" stroke="#d64545" stroke-width="2"/></svg>`,
    sparkle: `<svg viewBox="0 0 40 40" style="width:100%;height:100%;"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="#ffe266" stroke="#e8a000" stroke-width="1.5"/></svg>`,
    feather: `<svg viewBox="0 0 40 40" style="width:100%;height:100%;"><path d="M32 4 Q12 10 8 34 Q10 36 12 35 Q30 28 32 4 Z" fill="#fdfcf7" stroke="#cfc9ba" stroke-width="2"/><path d="M28 10 Q16 20 11 32" stroke="#cfc9ba" stroke-width="1.5" fill="none"/></svg>`,
    puff:    `<svg viewBox="0 0 40 40" style="width:100%;height:100%;"><circle cx="20" cy="20" r="14" fill="#ffffffcc"/></svg>`,
    petal:   `<svg viewBox="0 0 40 40" style="width:100%;height:100%;"><ellipse cx="20" cy="20" rx="9" ry="15" fill="#ff8fc7" stroke="#e06ba8" stroke-width="2"/></svg>`,
    note:    `<svg viewBox="0 0 40 40" style="width:100%;height:100%;"><path d="M15 30 L15 8 L30 5 L30 26" stroke="#6b4b8a" stroke-width="3.5" fill="none"/><ellipse cx="11" cy="30" rx="5" ry="4" fill="#6b4b8a"/><ellipse cx="26" cy="26" rx="5" ry="4" fill="#6b4b8a"/></svg>`,
    rainbowdot: `<svg viewBox="0 0 40 40" style="width:100%;height:100%;"><circle cx="20" cy="20" r="12" fill="#ab47bc"/><circle cx="20" cy="20" r="8" fill="#4fc3f7"/><circle cx="20" cy="20" r="4" fill="#ffee58"/></svg>`
  };

  return {
    sun, cloud, hills, grassTuft, flowerSmall, tree, pine, bush, fence, barn, volcano, palm,
    meadowScene,
    chicken, corn, egg, dinoRex, dinoBronto, dinoDragon, kid, plush, pillow,
    foods, garden,
    sofa, bed, chair, toybox, basket, windowArt, picture,
    star, home, speaker, trashcan, reset, album, note, unicornMini, swingMini, trampolineMini,
    particles
  };
})();
