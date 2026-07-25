/* Dinos füttern: Futter aus dem Tablett zum richtigen Dino ziehen.
   T-Rex mag Fleisch, Langhals mag Pflanzen, der Drache frisst alles.
   8 Fütterungen = 1 Stern. */
(window.GameModules = window.GameModules || {}).dino = {
  title: 'Dinos füttern',
  tileClass: 'tile-dino',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #ffd97a 0%, #ffe9b0 34%, #9ccc65 34%, #689f38 100%)';
    stage.innerHTML = `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:0;">
        <div style="position:absolute; right:6%; top:3%; width:clamp(100px,15vw,180px); aspect-ratio:160/130;">${Art.volcano()}</div>
        <div style="position:absolute; left:3%; top:6%; width:clamp(80px,12vw,150px); aspect-ratio:130/150;">${Art.palm()}</div>
        <div style="position:absolute; left:0; right:0; bottom:52%; height:16%;">${Art.hills('#b5d97e', 2)}</div>
        <div style="position:absolute; top:10%; left:30%; width:clamp(80px,12vw,140px); aspect-ratio:16/9; animation:float-cloud 60s linear infinite;">${Art.cloud()}</div>
        <div style="position:absolute; left:14%; bottom:8%; width:clamp(30px,4vw,54px); aspect-ratio:60/40;">${Art.grassTuft()}</div>
        <div style="position:absolute; right:12%; bottom:24%; width:clamp(30px,4vw,54px); aspect-ratio:60/40;">${Art.grassTuft()}</div>
      </div>`;

    const MEAT = ['keule', 'steak', 'wurst'];
    const PLANTS = ['brokkoli', 'karotte', 'banane', 'apfel', 'salat'];
    const ALL = MEAT.concat(PLANTS);

    const dinos = [
      { art: Art.dinoRex(),    likes: MEAT,   bubble: Art.foods.keule(),    x: 0.17 },
      { art: Art.dinoBronto(), likes: PLANTS, bubble: Art.foods.brokkoli(), x: 0.5 },
      { art: Art.dinoDragon(), likes: ALL,    bubble: Art.particles.heart,  x: 0.83 }
    ];

    let fed = 0;
    const GOAL = 8;
    function updateProgress() {
      api.setProgress(`<span class="icon" style="width:1.3em; height:1.3em;">${Art.foods.keule()}</span>&nbsp;${fed} / ${GOAL}`);
    }
    updateProgress();

    // Dinos aufstellen
    dinos.forEach((d, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'sprite';
      wrap.style.left = `calc(${d.x * 100}% - clamp(70px, 11vw, 110px))`;
      wrap.style.top = '26%';
      wrap.style.width = 'clamp(140px, 22vw, 220px)';
      wrap.style.textAlign = 'center';
      wrap.innerHTML = `
        <div class="dino-bubble anim-float" style="width:clamp(44px,6vw,60px); height:clamp(44px,6vw,60px);
          background:linear-gradient(180deg,#ffffff,#f0ead9); border:3px solid rgba(0,0,0,.1); border-radius:50%;
          padding:7px; display:inline-block; margin-bottom:2px; box-shadow:0 4px 8px rgba(0,0,0,.15);
          animation-delay:${i * 0.4}s;">${d.bubble}</div>
        <div class="dino-body anim-breathe" style="width:100%; aspect-ratio:1; animation-delay:${i * 0.5}s;">${d.art}</div>
        <div class="char-shadow" style="left:15%; right:15%; height:14px; bottom:-6px;"></div>`;
      stage.appendChild(wrap);
      d.el = wrap;
      d.body = wrap.querySelector('.dino-body');
    });

    // Futter-Tablett (Holz)
    const tray = document.createElement('div');
    tray.style.cssText = `position:absolute; left:50%; bottom:10px; transform:translateX(-50%);
      background:linear-gradient(180deg,#a5784e,#8d6748); border:3px solid #6b4b3a; border-radius:22px;
      padding:10px 18px; display:flex; gap:14px; z-index:20;
      box-shadow:inset 0 3px 0 rgba(255,255,255,.25), 0 6px 0 #5a4030, 0 12px 18px rgba(0,0,0,.3);`;
    stage.appendChild(tray);

    function makeFoodItem() {
      const key = ALL[Math.floor(Math.random() * ALL.length)];
      const item = document.createElement('div');
      item.dataset.food = key;
      item.innerHTML = Art.foods[key]();
      item.style.cssText = `width:clamp(46px,7vw,64px); height:clamp(46px,7vw,64px);
        cursor:grab; touch-action:none; filter:drop-shadow(0 3px 3px rgba(0,0,0,.25)); transition:transform .12s;`;
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
      ghost.innerHTML = src.innerHTML;
      ghost.style.cssText = `position:absolute; width:74px; height:74px; pointer-events:none; z-index:100;
        transform:translate(-50%,-55%) scale(1.15); filter:drop-shadow(0 8px 8px rgba(0,0,0,.3));`;
      stage.appendChild(ghost);
      src.style.visibility = 'hidden';
      drag = { src, ghost, food: src.dataset.food };
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
        // Richtig! Kauen, Schmatzen + Freude
        Sound.play('chomp');
        api.buzz(15);
        setTimeout(() => Sound.play('giggle'), 250);
        hit.body.classList.remove('anim-happy', 'anim-breathe', 'chewing');
        void hit.body.offsetWidth; // Animation neu starten
        hit.body.classList.add('chewing');
        setTimeout(() => {
          hit.body.classList.remove('chewing');
          hit.body.classList.add('anim-happy');
        }, 750);
        setTimeout(() => hit.body.classList.add('anim-breathe'), 1400);
        api.burst(e.clientX - r.left, e.clientY - r.top, ['heart', 'sparkle'], 8, 28);
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

    return () => {
      stage.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }
};
