/* Kissenschlacht: Freche Plüschtiere tauchen hinter den Möbeln auf.
   Tippen wirft ein Kissen dorthin – Treffer gibt eine Federnwolke.
   10 Treffer = 1 Stern. */
(window.GameModules = window.GameModules || {}).kissen = {
  title: 'Kissenschlacht',
  icon: '🛏️',
  tileClass: 'tile-kissen',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #ffe0b2 0%, #ffe0b2 62%, #bcaaa4 62%, #a1887f 100%)';

    const PLUSHIES = ['🧸', '🐰', '🐷', '🐨', '🐸'];
    let hits = 0;
    const GOAL = 10;
    let running = true;

    function updateProgress() {
      api.setProgress(`🧸 ${hits} / ${GOAL}`);
    }
    updateProgress();

    // Möbel als Verstecke (Positionen in % der Bühne)
    const HIDEOUTS = [
      { x: 0.18, y: 0.60, furniture: '🛋️', fsize: 120 },
      { x: 0.50, y: 0.58, furniture: '🛏️', fsize: 130 },
      { x: 0.80, y: 0.60, furniture: '🪑', fsize: 100 },
      { x: 0.34, y: 0.72, furniture: '📦', fsize: 90 },
      { x: 0.66, y: 0.74, furniture: '🧺', fsize: 84 }
    ];
    // Fenster + Bild als Deko
    stage.innerHTML += `
      <div class="sprite" style="left:8%; top:10%; font-size:70px;">🪟</div>
      <div class="sprite" style="right:10%; top:9%; font-size:60px;">🖼️</div>`;

    HIDEOUTS.forEach(h => {
      // Plüschtier steckt HINTER dem Möbel: erst Tier, dann Möbel ins DOM
      const plush = document.createElement('div');
      plush.className = 'sprite';
      plush.style.cssText = `font-size:64px; z-index:5; transition:transform .25s ease-out;
        left:calc(${h.x * 100}% - 32px); top:calc(${h.y * 100}% - 40px); transform:translateY(70px) scale(.4);`;
      stage.appendChild(plush);
      const furn = document.createElement('div');
      furn.className = 'sprite';
      furn.textContent = h.furniture;
      furn.style.cssText = `font-size:${h.fsize}px; z-index:6; left:calc(${h.x * 100}% - ${h.fsize / 2}px); top:calc(${h.y * 100}% - ${h.fsize * 0.35}px);`;
      stage.appendChild(furn);
      h.plushEl = plush;
      h.visible = false;
    });

    /* Plüschtiere auftauchen lassen */
    function popUp() {
      if (!running) return;
      const free = HIDEOUTS.filter(h => !h.visible);
      if (free.length) {
        const h = free[Math.floor(Math.random() * free.length)];
        h.visible = true;
        h.plushEl.textContent = PLUSHIES[Math.floor(Math.random() * PLUSHIES.length)];
        h.plushEl.style.transform = 'translateY(0) scale(1)';
        Sound.play('pop');
        h.hideTimer = setTimeout(() => hide(h), 1700 + Math.random() * 800);
      }
      spawnTimer = setTimeout(popUp, 700 + Math.random() * 900);
    }
    function hide(h) {
      h.visible = false;
      h.plushEl.style.transform = 'translateY(70px) scale(.4)';
    }
    let spawnTimer = setTimeout(popUp, 500);

    /* Kissenwurf */
    let throwing = false;
    function onTap(e) {
      if (throwing) return;
      const r = stage.getBoundingClientRect();
      const tx = e.clientX - r.left, ty = e.clientY - r.top;
      throwing = true;
      Sound.play('whoosh');
      const pillow = document.createElement('div');
      pillow.className = 'sprite';
      pillow.style.cssText = `width:60px; height:42px; z-index:20;
        background:linear-gradient(160deg, #ce93d8, #9575cd); border-radius:46% 46% 46% 46% / 58% 58% 58% 58%;
        box-shadow:inset 0 -6px 0 rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.2);
        transform:translate(${r.width / 2 - 30}px, ${r.height - 60}px) rotate(0deg);
        transition:transform .38s cubic-bezier(.3,.6,.6,1);`;
      stage.appendChild(pillow);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        pillow.style.transform = `translate(${tx - 24}px, ${ty - 24}px) rotate(540deg)`;
      }));
      setTimeout(() => {
        pillow.remove();
        throwing = false;
        // Treffer? Sichtbares Plüschtier in der Nähe des Einschlags
        const hit = HIDEOUTS.find(h => {
          if (!h.visible) return false;
          const px = h.x * r.width, py = h.y * r.height - 20;
          return Math.hypot(px - tx, py - ty) < 85;
        });
        if (hit) {
          hits++;
          clearTimeout(hit.hideTimer);
          Sound.play('giggle');
          api.burst(tx, ty, ['🪶', '🪶', '💨'], 10, 30);
          hit.plushEl.style.transform = 'translateY(70px) scale(.4) rotate(20deg)';
          hit.visible = false;
          if (hits >= GOAL) {
            api.awardStar();
            hits = 0;
          }
          updateProgress();
        } else {
          Sound.play('tap');
          api.burst(tx, ty, ['💨'], 3, 22);
        }
      }, 390);
    }
    stage.addEventListener('pointerdown', onTap);

    return () => {
      running = false;
      clearTimeout(spawnTimer);
      HIDEOUTS.forEach(h => clearTimeout(h.hideTimer));
      stage.removeEventListener('pointerdown', onTap);
    };
  }
};
