/* Hub, Navigation und gemeinsame Spiel-Helfer.
   Jedes Spiel registriert sich in GameModules (siehe js/games/*.js) mit:
   { title, icon, tileClass, goal, start(stage, api) -> cleanupFn } */
const GameModules = window.GameModules || (window.GameModules = {});

const UI = (() => {
  const app = document.getElementById('app');
  const ORDER = ['dino', 'einhorn', 'garten', 'huehner', 'trampolin', 'kissen', 'schaukel'];
  let currentCleanup = null;

  /* --- Emoji-Partikel-Explosion, von allen Spielen genutzt --- */
  function burst(container, x, y, emojis, count = 8, size = 30) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.fontSize = (size * (0.7 + Math.random() * 0.6)) + 'px';
      const ang = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 90;
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', (Math.sin(ang) * dist - 40) + 'px');
      container.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }

  /* --- Stern vergeben: Sound, Flug-Animation, Speicherung --- */
  function awardStar(gameId) {
    Storage.addStar(gameId);
    Sound.play('star');
    const star = document.createElement('div');
    star.className = 'fly-star';
    star.textContent = '⭐';
    star.style.left = '50%';
    star.style.top = '50%';
    star.style.transform = 'translate(-50%, -50%) scale(3)';
    document.body.appendChild(star);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      star.style.left = '90%';
      star.style.top = '30px';
      star.style.transform = 'scale(1)';
    }));
    setTimeout(() => star.remove(), 1200);
    const prog = document.querySelector('.game-progress');
    if (prog) prog.classList.add('anim-pulse');
  }

  /* --- Hauptmenü --- */
  function showHub() {
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    const stars = Storage.get('stars', {});
    app.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'screen hub';
    hub.innerHTML = `
      <div class="hub-topbar">
        <div class="star-counter">⭐ <span id="total-stars">${Storage.totalStars()}</span></div>
        <button class="btn-round" id="mute-btn">${Sound.isMuted() ? '🔇' : '🔊'}</button>
      </div>
      <div class="hub-title">🌈 Bennets Spielewelt 🌈</div>
      <div class="tile-grid"></div>
    `;
    const grid = hub.querySelector('.tile-grid');
    ORDER.forEach(id => {
      const g = GameModules[id];
      if (!g) return;
      const tile = document.createElement('button');
      tile.className = 'game-tile ' + g.tileClass;
      const n = stars[id] || 0;
      const starRow = n > 0 ? '⭐'.repeat(Math.min(n, 5)) + (n > 5 ? '+' : '') : '';
      tile.innerHTML = `<span>${g.icon}</span><span class="tile-label">${g.title}</span><span class="tile-stars">${starRow}</span>`;
      tile.addEventListener('pointerdown', () => { Sound.play('pop'); startGame(id); });
      grid.appendChild(tile);
    });
    hub.querySelector('#mute-btn').addEventListener('pointerdown', (e) => {
      const m = Sound.toggleMute();
      e.currentTarget.textContent = m ? '🔇' : '🔊';
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
        <button class="btn-round" id="home-btn">🏠</button>
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
      burst: (x, y, emojis, count, size) => burst(screen, x, y, emojis, count, size),
      awardStar: () => awardStar(id),
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
