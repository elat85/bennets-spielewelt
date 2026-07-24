/* Garten dekorieren: Sachen aus der Leiste auf die Wiese ziehen,
   verschieben oder in den Mülleimer werfen. Der Garten bleibt gespeichert.
   8 neue Sachen platziert = 1 Stern. */
(window.GameModules = window.GameModules || {}).garten = {
  title: 'Garten dekorieren',
  tileClass: 'tile-garten',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #6ec3f5 0%, #b5e3ff 36%, #93cf62 36%, #7ec850 100%)';
    stage.innerHTML = `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:0;">
        <div style="position:absolute; left:3%; top:3%; width:clamp(80px,12vw,130px); aspect-ratio:1;">${Art.sun()}</div>
        <div style="position:absolute; top:6%; width:clamp(90px,14vw,160px); aspect-ratio:16/9; animation:float-cloud 48s linear infinite;">${Art.cloud()}</div>
        <div style="position:absolute; top:15%; width:clamp(70px,10vw,120px); aspect-ratio:16/9; animation:float-cloud 66s linear infinite; animation-delay:-25s; opacity:.85;">${Art.cloud()}</div>
        <div style="position:absolute; left:0; right:0; bottom:56%; height:14%;">${Art.hills('#a8d878', 0)}</div>
      </div>`;

    const KINDS = Object.keys(Art.garden);
    const BASE_SIZE = {
      tulpe: 64, sonnenblume: 72, gaensebluemchen: 60, baum: 120, tanne: 110, pilz: 62,
      brunnen: 96, ente: 60, schmetterling: 56, biene: 48, stein: 64, vogelhaus: 92
    };
    let placedThisRound = 0;
    const GOAL = 8;
    let saved = Storage.get('garten.items', []).filter(i => Art.garden[i.kind]);

    function updateProgress() {
      api.setProgress(`<span class="icon" style="width:1.2em; height:1.5em;">${Art.garden.tulpe()}</span>&nbsp;${placedThisRound} / ${GOAL}`);
    }
    updateProgress();

    // Mülleimer
    const trash = document.createElement('div');
    trash.innerHTML = Art.trashcan();
    trash.style.cssText = `position:absolute; right:14px; bottom:110px; width:clamp(52px,8vw,72px);
      aspect-ratio:60/70; z-index:40; transition:transform .15s; filter:drop-shadow(0 4px 5px rgba(0,0,0,.25));`;
    stage.appendChild(trash);

    // Item-Leiste (Holzregal)
    const bar = document.createElement('div');
    bar.style.cssText = `position:absolute; left:0; right:0; bottom:0; display:flex; gap:8px; align-items:flex-end;
      overflow-x:auto; padding:10px 14px; z-index:30; touch-action:pan-x;
      background:linear-gradient(180deg,#a5784e,#8d6748); border-top:4px solid #6b4b3a;
      box-shadow:inset 0 3px 0 rgba(255,255,255,.2), 0 -6px 14px rgba(0,0,0,.18);`;
    KINDS.forEach(kind => {
      const b = document.createElement('div');
      b.innerHTML = Art.garden[kind]();
      b.style.cssText = `width:clamp(48px,7vw,66px); height:clamp(48px,7vw,66px); padding:2px;
        cursor:grab; touch-action:none; flex:0 0 auto; filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));`;
      b.addEventListener('pointerdown', e => startDrag(e, kind, null));
      bar.appendChild(b);
    });
    stage.appendChild(bar);

    /* Gespeicherte Gartenteile aufbauen */
    function spawnSprite(item) {
      const el = document.createElement('div');
      el.className = 'sprite tappable';
      el.innerHTML = Art.garden[item.kind]();
      el.style.width = el.style.height = item.size + 'px';
      el.style.zIndex = Math.floor(item.y * 100) + 10;
      el.style.filter = 'drop-shadow(0 4px 4px rgba(20,50,10,.25))';
      el.style.transform = `translate(${item.x * stage.clientWidth - item.size / 2}px, ${item.y * stage.clientHeight - item.size}px)`;
      el.addEventListener('pointerdown', e => startDrag(e, item.kind, item));
      stage.appendChild(el);
      item.el = el;
      return item;
    }
    saved.forEach(spawnSprite);

    function persist() {
      Storage.set('garten.items', saved.map(({ kind, x, y, size }) => ({ kind, x, y, size })));
    }

    /* Drag: neues Item aus der Leiste oder bestehendes verschieben */
    let drag = null;
    function startDrag(e, kind, existing) {
      e.preventDefault();
      e.stopPropagation();
      if (drag) return;
      Sound.play('tap');
      let item = existing;
      if (!item) {
        const base = BASE_SIZE[kind] || 64;
        item = spawnSprite({ kind, x: 0.5, y: 0.6, size: Math.round(base * (0.9 + Math.random() * 0.3)) });
        saved.push(item);
        item.isNew = true;
      }
      item.el.style.zIndex = 500;
      drag = item;
      moveTo(e);
    }
    function moveTo(e) {
      if (!drag) return;
      const r = stage.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      drag.x = Math.min(Math.max(x / r.width, 0.02), 0.98);
      drag.y = Math.min(Math.max(y / r.height, 0.36), 0.86);
      drag.el.style.transform = `translate(${drag.x * r.width - drag.size / 2}px, ${drag.y * r.height - drag.size}px)`;
      // Mülleimer-Feedback
      const t = trash.getBoundingClientRect();
      const overTrash = e.clientX > t.left - 24 && e.clientX < t.right + 24 && e.clientY > t.top - 24 && e.clientY < t.bottom + 24;
      trash.style.transform = overTrash ? 'scale(1.3) rotate(-8deg)' : '';
      drag.overTrash = overTrash;
    }
    function onMove(e) { moveTo(e); }
    function onUp(e) {
      if (!drag) return;
      const r = stage.getBoundingClientRect();
      if (drag.overTrash) {
        Sound.play('whoosh');
        api.burst(drag.x * r.width, drag.y * r.height - 30, ['puff', 'sparkle'], 6, 24);
        drag.el.remove();
        saved = saved.filter(i => i !== drag);
      } else {
        Sound.play('pop');
        drag.el.style.zIndex = Math.floor(drag.y * 100) + 10;
        api.burst(drag.x * r.width, drag.y * r.height - drag.size / 3, ['sparkle'], 4, 16);
        if (drag.isNew) {
          drag.isNew = false;
          placedThisRound++;
          if (placedThisRound >= GOAL) {
            api.awardStar();
            placedThisRound = 0;
          }
          updateProgress();
        }
      }
      trash.style.transform = '';
      persist();
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
