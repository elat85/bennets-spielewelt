/* Hub, Navigation und gemeinsame Spiel-Helfer.
   Jedes Spiel registriert sich in GameModules (siehe js/games/*.js) mit:
   { title, tileArt, tileClass, start(stage, api) -> cleanupFn } */
const GameModules = window.GameModules || (window.GameModules = {});

const UI = (() => {
  const app = document.getElementById('app');
  const ORDER = ['dino', 'einhorn', 'garten', 'huehner', 'trampolin', 'kissen', 'schaukel'];
  const TILE_ART = {
    dino: () => Art.charImg('img/chars/rex-1.webp'),
    einhorn: () => Art.unicornMini(),
    garten: () => Art.garden.tulpe(),
    huehner: () => Art.charImg('img/chars/huhn-1.webp'),
    trampolin: () => Art.charImg('img/chars/kind-1.webp'),
    kissen: () => Art.charImg('img/chars/teddy.webp'),
    schaukel: () => Art.charImg('img/chars/kind-2.webp')
  };
  let currentCleanup = null;

  /* --- Partikel-Explosion: SVG-Partikel (Art.particles) oder Text --- */
  function burst(container, x, y, kinds, count = 8, size = 30) {
    for (let i = 0; i < count; i++) {
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const p = document.createElement('div');
      p.className = 'particle';
      if (Art.particles[kind]) p.innerHTML = Art.particles[kind];
      else p.textContent = kind;
      const s = size * (0.7 + Math.random() * 0.6);
      p.style.cssText += `left:${x}px; top:${y}px; width:${s}px; height:${s}px; font-size:${s}px;`;
      const ang = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 90;
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', (Math.sin(ang) * dist - 40) + 'px');
      p.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
      container.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }

  /* --- Konfetti-Regen über den ganzen Bildschirm --- */
  function confetti(n = 34) {
    const colors = ['#ff6b6b', '#ffd93b', '#7ac74f', '#68b8e8', '#b49ae0', '#ff8fc7', '#ff9f43'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-bit';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = Math.random() * 0.5 + 's';
      c.style.animationDuration = (1.3 + Math.random() * 0.9) + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 2600);
    }
  }

  /* --- Sanftes Vibrations-Feedback (wo unterstützt) --- */
  function buzz(pattern = 15) {
    try { navigator.vibrate && navigator.vibrate(pattern); } catch (e) {}
  }

  /* --- Stern vergeben: große Feier + Flug zum Zähler --- */
  function awardStar(gameId) {
    Storage.addStar(gameId);
    Sound.play('star');
    buzz([40, 80, 40]);
    confetti();
    const cele = document.createElement('div');
    cele.className = 'celebration';
    cele.innerHTML = `<div class="big-star">${Art.star(true)}</div>`;
    document.body.appendChild(cele);
    setTimeout(() => {
      cele.remove();
      const fly = document.createElement('div');
      fly.className = 'fly-star';
      fly.innerHTML = Art.star(true);
      fly.style.left = 'calc(50% - 35px)';
      fly.style.top = 'calc(50% - 35px)';
      document.body.appendChild(fly);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fly.style.left = 'calc(100% - 90px)';
        fly.style.top = '20px';
        fly.style.transform = 'scale(.5)';
      }));
      setTimeout(() => fly.remove(), 1000);
    }, 1200);
  }

  /* --- Fortschritt: n von total als Sternchen-Reihe --- */
  function starRowHtml(n, total) {
    let h = '<span class="stars-row">';
    for (let i = 0; i < total; i++) h += `<span class="icon">${Art.star(i < n)}</span>`;
    return h + '</span>';
  }

  /* --- Sticker-Album: alle 3 Sterne wird ein Sticker freigeschaltet --- */
  const STICKER_IMGS = [
    'stickers/einhorn', 'chars/huhn-1', 'chars/rex-1', 'chars/teddy', 'stickers/blume',
    'stickers/sonne', 'stickers/schmetterling', 'stickers/regenbogen', 'chars/langhals-1', 'chars/hase',
    'stickers/ente', 'stickers/eis', 'stickers/ball', 'chars/kind-1', 'stickers/pilz',
    'stickers/marienkaefer', 'chars/drache-1', 'chars/schwein', 'stickers/auto', 'stickers/rakete',
    'stickers/stern', 'stickers/torte', 'chars/koala', 'stickers/ballon', 'stickers/krone'
  ];
  const STICKERS = STICKER_IMGS.map(p => () => Art.charImg(`img/${p}.webp`));
  const STAR_PER_STICKER = 3;
  const unlockedStickers = () => Math.min(Math.floor(Storage.totalStars() / STAR_PER_STICKER), STICKERS.length);
  const hasNewSticker = () => unlockedStickers() > Storage.get('album.seen', 0);

  function showAlbum() {
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    const unlocked = unlockedStickers();
    const seen = Storage.get('album.seen', 0);
    app.innerHTML = '';
    const scr = document.createElement('div');
    scr.className = 'screen album-screen';
    const toNext = STAR_PER_STICKER - (Storage.totalStars() % STAR_PER_STICKER);
    let grid = '';
    STICKERS.forEach((fn, i) => {
      const isNew = i >= seen && i < unlocked;
      const locked = i >= unlocked;
      grid += `<div class="sticker ${locked ? 'locked' : ''} ${isNew ? 'anim-pop' : ''}"
        style="${isNew ? `animation-delay:${0.3 + (i - seen) * 0.25}s; animation-fill-mode:backwards;` : ''}">
        ${fn()}${locked ? `<span class="sticker-lock icon">${Art.star(false)}</span>` : ''}</div>`;
    });
    scr.innerHTML = `
      <div class="game-topbar">
        <button class="btn-round" id="album-home"><span class="icon">${Art.home()}</span></button>
        <div class="game-progress">${unlocked < STICKERS.length ? starRowHtml(STAR_PER_STICKER - toNext, STAR_PER_STICKER) : '<span class="icon">' + Art.star(true) + '</span>'}</div>
      </div>
      <div class="album-title">Meine Sticker</div>
      <div class="album-grid">${grid}</div>`;
    app.appendChild(scr);
    scr.querySelector('#album-home').addEventListener('pointerdown', () => { Sound.play('tap'); showHub(); });
    if (unlocked > seen) {
      Sound.play('yay');
      confetti(20);
      Storage.set('album.seen', unlocked);
    }
  }

  /* --- Hauptmenü --- */
  function showHub() {
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    const stars = Storage.get('stars', {});
    app.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'screen hub';
    hub.innerHTML = `
      ${Art.scene('img/scenes/hub.webp')}
      <div class="hub-header">
        <div class="hub-side">
          <div class="star-counter"><span class="icon">${Art.star(true)}</span><span id="total-stars">${Storage.totalStars()}</span></div>
          <button class="btn-round" id="album-btn" style="position:relative;">
            <span class="icon">${Art.album()}</span>
            ${hasNewSticker() ? '<span class="badge-new"></span>' : ''}
          </button>
        </div>
        <div class="hub-titles">
          <div class="hub-title">${'Bennets Spielewelt'.split('').map((ch, i) =>
            ch === ' ' ? ' ' : `<span style="animation-delay:${i * 0.09}s">${ch}</span>`).join('')}</div>
          <div class="hub-subtitle">Such dir ein Spiel aus!</div>
        </div>
        <div class="hub-side">
          <button class="btn-round" id="lock-btn" style="opacity:.75;"><span class="icon">${Art.lock()}</span></button>
          <button class="btn-round" id="music-btn"><span class="icon">${Art.note(Sound.isMusicOn())}</span></button>
          <button class="btn-round" id="mute-btn"><span class="icon">${Art.speaker(!Sound.isMuted())}</span></button>
        </div>
      </div>
      <div class="tile-grid"></div>
    `;
    const grid = hub.querySelector('.tile-grid');
    ORDER.forEach(id => {
      const g = GameModules[id];
      if (!g) return;
      const tile = document.createElement('button');
      tile.className = 'game-tile ' + g.tileClass;
      const n = Math.min(stars[id] || 0, 5);
      let starRow = '';
      for (let i = 0; i < n; i++) starRow += `<span class="icon">${Art.star(true)}</span>`;
      tile.innerHTML = `
        <span class="tile-art">${TILE_ART[id]()}</span>
        <span class="tile-label">${g.title}</span>
        <span class="tile-stars">${starRow}</span>`;
      tile.addEventListener('pointerdown', () => { Sound.play('pop'); startGame(id); });
      grid.appendChild(tile);
    });
    hub.querySelector('#mute-btn').addEventListener('pointerdown', (e) => {
      const btn = e.currentTarget;
      const m = Sound.toggleMute();
      btn.querySelector('.icon').innerHTML = Art.speaker(!m);
      if (!m) Sound.play('pop');
    });
    hub.querySelector('#music-btn').addEventListener('pointerdown', (e) => {
      const btn = e.currentTarget;
      const on = Sound.toggleMusic();
      btn.querySelector('.icon').innerHTML = Art.note(on);
    });
    hub.querySelector('#album-btn').addEventListener('pointerdown', () => {
      Sound.play('pop');
      showAlbum();
    });
    hub.querySelector('#lock-btn').addEventListener('pointerdown', () => {
      if (window.gateExit) window.gateExit();
    });
    app.appendChild(hub);
  }

  /* --- Spiel starten --- */
  function startGame(id) {
    const g = GameModules[id];
    if (!g) return;
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    app.innerHTML = '';
    const screen = document.createElement('div');
    screen.className = 'screen game-screen';
    screen.innerHTML = `
      <div class="game-stage"></div>
      <div class="game-topbar">
        <button class="btn-round" id="home-btn"><span class="icon">${Art.home()}</span></button>
        <div class="game-progress"><span id="progress-icons"></span></div>
      </div>
    `;
    app.appendChild(screen);
    screen.querySelector('#home-btn').addEventListener('pointerdown', () => {
      Sound.play('tap');
      showHub();
    });
    const stage = screen.querySelector('.game-stage');
    const api = {
      burst: (x, y, kinds, count, size) => burst(screen, x, y, kinds, count, size),
      awardStar: () => awardStar(id),
      buzz,
      starRow: starRowHtml,
      setProgress(html) {
        const el = screen.querySelector('#progress-icons');
        if (el) el.innerHTML = html;
      }
    };
    currentCleanup = g.start(stage, api) || null;
  }

  return { showHub, showAlbum, startGame, burst };
})();

/* Kein Kontextmenü, kein Doppeltipp-Zoom */
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());

/* ===== Eltern-Gate: Rechenaufgabe statt einfach rausgehen =====
   Fängt die Zurück-Taste/-Geste ab. Der Home-Button lässt sich aus dem
   Browser prinzipiell nicht abfangen — dafür Android-App-Anheften nutzen. */
const Gate = (() => {
  let overlay = null;
  let answer = 0;
  let typed = '';

  function newTask() {
    const a = 2 + Math.floor(Math.random() * 8);        // 2–9
    const b = 21 + Math.floor(Math.random() * 39);      // 21–59
    answer = a + b;
    typed = '';
    if (overlay) {
      overlay.querySelector('.gate-task').textContent = `${a} + ${b} = ?`;
      overlay.querySelector('.gate-display').textContent = '_';
    }
  }

  function show(onSuccess) {
    if (overlay) return;
    Sound.play('tap');
    overlay = document.createElement('div');
    overlay.className = 'gate-overlay';
    let pad = '';
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK']) {
      pad += `<button class="gate-key${d === 'OK' ? ' gate-ok' : ''}" data-key="${d}">${d === 'C' ? '⌫' : d}</button>`;
    }
    overlay.innerHTML = `
      <div class="gate-box">
        <button class="gate-close">✕</button>
        <div class="gate-title">Frag Mama oder Papa!</div>
        <div class="gate-task"></div>
        <div class="gate-display">_</div>
        <div class="gate-pad">${pad}</div>
      </div>`;
    document.body.appendChild(overlay);
    newTask();
    overlay.querySelector('.gate-close').addEventListener('pointerdown', hide);
    overlay.querySelectorAll('.gate-key').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        const k = btn.dataset.key;
        Sound.play('tap');
        if (k === 'C') typed = typed.slice(0, -1);
        else if (k === 'OK') {
          if (parseInt(typed, 10) === answer) {
            Sound.play('yay');
            hide();
            onSuccess();
          } else {
            Sound.play('wrong');
            const box = overlay.querySelector('.gate-box');
            box.classList.remove('anim-shake');
            void box.offsetWidth;
            box.classList.add('anim-shake');
            newTask();
          }
          return;
        } else if (typed.length < 3) typed += k;
        overlay.querySelector('.gate-display').textContent = typed || '_';
      });
    });
  }

  function hide() {
    if (overlay) { overlay.remove(); overlay = null; }
  }

  return { show };
})();

/* Zurück-Wächter: erst nach gelöster Aufgabe darf die App verlassen werden */
(() => {
  let allowLeave = false;
  let guardActive = false;

  function arm() {
    if (guardActive) return;
    history.pushState({ bennetGuard: true }, '');
    guardActive = true;
  }
  arm();

  window.addEventListener('popstate', () => {
    guardActive = false; // unser Wächter-Eintrag wurde soeben entfernt
    if (allowLeave) return;
    arm(); // sofort wieder scharf stellen
    Gate.show(() => {
      allowLeave = true;
      const toast = document.createElement('div');
      toast.className = 'update-toast';
      toast.textContent = '🔓 Sperre 20 Sekunden offen — Zurück-Taste verlässt jetzt die App';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
      setTimeout(() => { allowLeave = false; arm(); }, 20000);
      history.back();
    });
  });

  window.gateExit = () => Gate.show(() => {
    allowLeave = true;
    setTimeout(() => { allowLeave = false; arm(); }, 20000);
    history.go(-2);
  });
})();

/* Musik darf erst nach der ersten Berührung starten (Browser-Vorgabe) */
document.addEventListener('pointerdown', function firstTouch() {
  document.removeEventListener('pointerdown', firstTouch);
  Sound.startMusic();
});

/* Bildschirm beim Spielen anlassen (Wake Lock, wo unterstützt) */
(() => {
  let lock = null;
  async function acquire() {
    try {
      if ('wakeLock' in navigator && !lock) {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
      }
    } catch (e) { /* z.B. Energiesparmodus – kein Problem */ }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquire();
  });
  document.addEventListener('pointerdown', acquire, { once: true });
})();

UI.showHub();

/* Splash sanft ausblenden, sobald alles steht */
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 600);
  }, 500);
});
