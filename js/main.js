/* Hub, Navigation und gemeinsame Spiel-Helfer.
   Jedes Spiel registriert sich in GameModules (siehe js/games/*.js) mit:
   { title, tileArt, tileClass, start(stage, api) -> cleanupFn } */
const GameModules = window.GameModules || (window.GameModules = {});

const UI = (() => {
  const app = document.getElementById('app');
  const ORDER = ['dino', 'einhorn', 'garten', 'huehner', 'trampolin', 'kissen', 'schaukel'];
  const TILE_ART = {
    dino: () => Art.dinoRex(),
    einhorn: () => Art.unicornMini(),
    garten: () => Art.garden.tulpe(),
    huehner: () => Art.chicken(),
    trampolin: () => Art.trampolineMini(),
    kissen: () => Art.pillow(),
    schaukel: () => Art.swingMini()
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

  /* --- Stern vergeben: große Feier + Flug zum Zähler --- */
  function awardStar(gameId) {
    Storage.addStar(gameId);
    Sound.play('star');
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

  /* --- Hauptmenü --- */
  function showHub() {
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    const stars = Storage.get('stars', {});
    app.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'screen hub';
    hub.innerHTML = `
      ${Art.meadowScene({ sunPos: 'left' })}
      <div class="hub-topbar">
        <div class="star-counter"><span class="icon">${Art.star(true)}</span><span id="total-stars">${Storage.totalStars()}</span></div>
        <button class="btn-round" id="mute-btn"><span class="icon">${Art.speaker(!Sound.isMuted())}</span></button>
      </div>
      <div class="hub-title">Bennets Spielewelt</div>
      <div class="hub-subtitle">Such dir ein Spiel aus!</div>
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
      starRow: starRowHtml,
      setProgress(html) {
        const el = screen.querySelector('#progress-icons');
        if (el) el.innerHTML = html;
      }
    };
    currentCleanup = g.start(stage, api) || null;
  }

  return { showHub, startGame, burst };
})();

/* Kein Kontextmenü, kein Doppeltipp-Zoom */
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());

UI.showHub();
