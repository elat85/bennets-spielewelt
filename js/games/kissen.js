/* Kissenschlacht: Freche Plüschtiere tauchen hinter den Möbeln auf.
   Tippen wirft ein Kissen dorthin – Treffer gibt eine Federnwolke.
   10 Treffer = 1 Stern. */
(window.GameModules = window.GameModules || {}).kissen = {
  title: 'Kissenschlacht',
  tileClass: 'tile-kissen',

  start(stage, api) {
    // Kinderzimmer: Tapete mit Punkten + Holzboden
    stage.style.background = `
      radial-gradient(circle at 20% 24%, #ffe9c9 0 10px, transparent 11px),
      radial-gradient(circle at 70% 12%, #ffe9c9 0 8px, transparent 9px),
      radial-gradient(circle at 45% 40%, #ffe9c9 0 9px, transparent 10px),
      radial-gradient(circle at 90% 34%, #ffe9c9 0 10px, transparent 11px),
      linear-gradient(180deg, #ffdba7 0%, #ffd092 58%, transparent 58%),
      repeating-linear-gradient(90deg, #c9a06c 0 90px, #bd9260 90px 92px, #c9a06c 92px 180px, #b3855a 180px 182px),
      linear-gradient(180deg, #c9a06c 0%, #b3855a 100%)`;

    stage.innerHTML = `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:1;">
        <div style="position:absolute; left:6%; top:6%; width:clamp(80px,11vw,140px); aspect-ratio:140/160;">${Art.windowArt()}</div>
        <div style="position:absolute; right:8%; top:8%; width:clamp(70px,9vw,110px); aspect-ratio:110/90;">${Art.picture()}</div>
      </div>`;

    const PLUSHIES = ['teddy', 'bunny', 'pig', 'koala'];
    let hits = 0;
    const GOAL = 10;
    let running = true;

    function updateProgress() {
      api.setProgress(`<span class="icon" style="width:1.3em; height:1.5em;">${Art.plush('teddy')}</span>&nbsp;${hits} / ${GOAL}`);
    }
    updateProgress();

    // Möbel als Verstecke (Positionen in % der Bühne)
    const HIDEOUTS = [
      { x: 0.16, y: 0.62, art: Art.sofa(),   w: 200, ar: '220/130' },
      { x: 0.50, y: 0.60, art: Art.bed(),    w: 215, ar: '230/140' },
      { x: 0.81, y: 0.62, art: Art.chair(),  w: 110, ar: '110/150' },
      { x: 0.33, y: 0.80, art: Art.toybox(), w: 130, ar: '130/100' },
      { x: 0.67, y: 0.82, art: Art.basket(), w: 115, ar: '120/90' }
    ];

    HIDEOUTS.forEach(h => {
      // Plüschtier steckt HINTER dem Möbel: erst Tier, dann Möbel ins DOM
      const plush = document.createElement('div');
      plush.className = 'sprite';
      plush.style.cssText = `width:clamp(60px,9vw,90px); aspect-ratio:110/130; z-index:5;
        transition:transform .25s ease-out;
        left:calc(${h.x * 100}% - clamp(30px,4.5vw,45px)); top:calc(${h.y * 100}% - clamp(64px,10vw,100px));
        transform:translateY(80px) scale(.4);`;
      plush.innerHTML = Art.plush('teddy');
      stage.appendChild(plush);
      const furn = document.createElement('div');
      furn.className = 'sprite';
      furn.innerHTML = h.art;
      furn.style.cssText = `width:clamp(${h.w * 0.55}px, ${h.w / 11}vw, ${h.w}px); aspect-ratio:${h.ar}; z-index:6;
        left:calc(${h.x * 100}% - clamp(${h.w * 0.28}px, ${h.w / 22}vw, ${h.w / 2}px));
        top:calc(${h.y * 100}% - clamp(${h.w * 0.18}px, ${h.w / 30}vw, ${h.w * 0.32}px));
        filter:drop-shadow(0 6px 6px rgba(60,30,10,.25));`;
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
        h.plushEl.innerHTML = Art.plush(PLUSHIES[Math.floor(Math.random() * PLUSHIES.length)]);
        h.plushEl.style.transform = 'translateY(0) scale(1)';
        Sound.play('pop');
        h.hideTimer = setTimeout(() => hide(h), 1700 + Math.random() * 800);
      }
      spawnTimer = setTimeout(popUp, 700 + Math.random() * 900);
    }
    function hide(h) {
      h.visible = false;
      h.plushEl.style.transform = 'translateY(80px) scale(.4)';
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
      pillow.innerHTML = Art.pillow();
      pillow.style.cssText = `width:66px; aspect-ratio:120/90; z-index:20;
        filter:drop-shadow(0 4px 5px rgba(0,0,0,.3));
        transform:translate(${r.width / 2 - 33}px, ${r.height - 66}px) rotate(0deg) scale(1.1);
        transition:transform .38s cubic-bezier(.3,.6,.6,1);`;
      stage.appendChild(pillow);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        pillow.style.transform = `translate(${tx - 33}px, ${ty - 25}px) rotate(540deg) scale(.9)`;
      }));
      setTimeout(() => {
        pillow.remove();
        throwing = false;
        // Treffer? Sichtbares Plüschtier in der Nähe des Einschlags
        const hit = HIDEOUTS.find(h => {
          if (!h.visible) return false;
          const px = h.x * r.width, py = h.y * r.height - 40;
          return Math.hypot(px - tx, py - ty) < 95;
        });
        if (hit) {
          hits++;
          clearTimeout(hit.hideTimer);
          Sound.play('giggle');
          api.buzz(15);
          api.burst(tx, ty, ['feather', 'feather', 'puff'], 11, 30);
          hit.plushEl.style.transform = 'translateY(80px) scale(.4) rotate(20deg)';
          hit.visible = false;
          if (hits >= GOAL) {
            api.awardStar();
            hits = 0;
          }
          updateProgress();
        } else {
          Sound.play('tap');
          api.burst(tx, ty, ['puff'], 3, 24);
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
