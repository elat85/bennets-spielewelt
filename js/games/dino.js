/* Dinos füttern: Futter aus dem Tablett zum richtigen Dino ziehen.
   T-Rex mag Fleisch, Langhals mag Pflanzen, der Drache frisst alles.
   8 Fütterungen = 1 Stern. */
(window.GameModules = window.GameModules || {}).dino = {
  title: 'Dinos füttern',
  icon: '🦖',
  tileClass: 'tile-dino',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #ffd97a 0%, #ffe9b0 30%, #9ccc65 30%, #689f38 100%)';

    const MEAT = ['🍖', '🍗', '🥩'];
    const PLANTS = ['🥦', '🥕', '🍌', '🍎', '🥬'];
    const ALL = MEAT.concat(PLANTS);

    const dinos = [
      { emoji: '🦖', likes: MEAT,   bubble: '🍖', x: 0.16 },
      { emoji: '🦕', likes: PLANTS, bubble: '🥦', x: 0.5 },
      { emoji: '🐉', likes: ALL,    bubble: '😋', x: 0.84 }
    ];

    let fed = 0;
    const GOAL = 8;
    function updateProgress() {
      api.setProgress(`🍽️ ${fed} / ${GOAL}`);
    }
    updateProgress();

    // Vulkan-Deko
    const deco = document.createElement('div');
    deco.innerHTML = `<div class="sprite" style="right:8%; top:5%; font-size:64px;">🌋</div>
      <div class="sprite" style="left:6%; top:6%; font-size:56px;">🌴</div>`;
    stage.appendChild(deco);

    // Dinos aufstellen
    dinos.forEach(d => {
      const wrap = document.createElement('div');
      wrap.className = 'sprite';
      wrap.style.left = `calc(${d.x * 100}% - 70px)`;
      wrap.style.top = '32%';
      wrap.style.width = '140px';
      wrap.style.textAlign = 'center';
      wrap.innerHTML = `
        <div class="dino-bubble" style="font-size:30px; background:rgba(255,255,255,.9); border-radius:20px; padding:4px 10px; display:inline-block; margin-bottom:4px;">💭${d.bubble}</div>
        <div class="dino-body" style="font-size:110px;">${d.emoji}</div>`;
      stage.appendChild(wrap);
      d.el = wrap;
      d.body = wrap.querySelector('.dino-body');
    });

    // Futter-Tablett
    const tray = document.createElement('div');
    tray.style.cssText = `position:absolute; left:50%; bottom:10px; transform:translateX(-50%);
      background:rgba(121,85,72,.85); border-radius:24px; padding:10px 16px;
      display:flex; gap:14px; z-index:20; box-shadow:0 4px 10px rgba(0,0,0,.25);`;
    stage.appendChild(tray);

    function makeFoodItem() {
      const item = document.createElement('div');
      item.textContent = ALL[Math.floor(Math.random() * ALL.length)];
      item.style.cssText = 'font-size:52px; line-height:1; cursor:grab; touch-action:none;';
      item.addEventListener('pointerdown', onFoodGrab);
      return item;
    }
    for (let i = 0; i < 5; i++) tray.appendChild(makeFoodItem());

    // Drag & Drop mit Pointer Events
    let drag = null;
    function onFoodGrab(e) {
      e.preventDefault();
      if (drag) return;
      const src = e.currentTarget;
      Sound.play('tap');
      const ghost = document.createElement('div');
      ghost.textContent = src.textContent;
      ghost.style.cssText = 'position:absolute; font-size:60px; line-height:1; pointer-events:none; z-index:100; transform:translate(-50%,-50%);';
      stage.appendChild(ghost);
      src.style.visibility = 'hidden';
      drag = { src, ghost, food: src.textContent };
      moveGhost(e);
    }
    function moveGhost(e) {
      if (!drag) return;
      const r = stage.getBoundingClientRect();
      drag.ghost.style.left = (e.clientX - r.left) + 'px';
      drag.ghost.style.top = (e.clientY - r.top) + 'px';
    }
    function onMove(e) { moveGhost(e); }
    function onUp(e) {
      if (!drag) return;
      const hit = dinos.find(d => {
        const b = d.body.getBoundingClientRect();
        return e.clientX > b.left - 25 && e.clientX < b.right + 25 &&
               e.clientY > b.top - 25 && e.clientY < b.bottom + 25;
      });
      const r = stage.getBoundingClientRect();
      if (hit && hit.likes.includes(drag.food)) {
        // Richtig! Schmatzen + Freude
        Sound.play('chomp');
        setTimeout(() => Sound.play('giggle'), 250);
        hit.body.classList.remove('anim-happy');
        void hit.body.offsetWidth; // Animation neu starten
        hit.body.classList.add('anim-happy');
        api.burst(e.clientX - r.left, e.clientY - r.top, ['❤️', '💛', '✨'], 8, 26);
        drag.ghost.remove();
        // Slot mit neuem Futter füllen
        const fresh = makeFoodItem();
        tray.replaceChild(fresh, drag.src);
        fed++;
        if (fed >= GOAL) {
          api.awardStar();
          fed = 0;
        }
        updateProgress();
      } else {
        if (hit) {
          // Falsches Futter: Dino schüttelt freundlich den Kopf
          Sound.play('wrong');
          hit.body.classList.remove('anim-shake');
          void hit.body.offsetWidth;
          hit.body.classList.add('anim-shake');
        }
        drag.ghost.remove();
        drag.src.style.visibility = '';
      }
      drag = null;
    }
    stage.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // Dinos wippen gemütlich
    dinos.forEach((d, i) => {
      d.body.style.animation = `wobble ${2 + i * 0.3}s ease-in-out infinite`;
    });

    return () => {
      stage.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }
};
