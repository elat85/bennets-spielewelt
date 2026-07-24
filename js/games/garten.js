/* Garten dekorieren: Sachen aus der Leiste auf die Wiese ziehen,
   verschieben oder in den Mülleimer werfen. Der Garten bleibt gespeichert.
   8 neue Sachen platziert = 1 Stern. */
(window.GameModules = window.GameModules || {}).garten = {
  title: 'Garten dekorieren',
  icon: '🌷',
  tileClass: 'tile-garten',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #90caf9 0%, #cfe9ff 38%, #aed581 38%, #7cb342 100%)';

    const ITEMS = ['🌷', '🌻', '🌼', '🌹', '🌳', '🌲', '🍄', '⛲', '🦆', '🦋', '🐝', '🪨', '🏠', '🧚'];
    let placedThisRound = 0;
    const GOAL = 8;
    let saved = Storage.get('garten.items', []);

    function updateProgress() {
      api.setProgress(`🌷 ${placedThisRound} / ${GOAL}`);
    }
    updateProgress();

    // Sonne + Wolke als feste Deko
    stage.innerHTML += `
      <div class="sprite" style="left:5%; top:4%; font-size:64px;">🌞</div>
      <div class="sprite" style="top:8%; font-size:54px; animation:float-cloud 45s linear infinite;">☁️</div>`;

    // Mülleimer
    const trash = document.createElement('div');
    trash.textContent = '🗑️';
    trash.style.cssText = `position:absolute; right:14px; bottom:96px; font-size:56px; z-index:40;
      filter:grayscale(.2); transition:transform .15s;`;
    stage.appendChild(trash);

    // Item-Leiste
    const bar = document.createElement('div');
    bar.style.cssText = `position:absolute; left:0; right:0; bottom:0; display:flex; gap:6px;
      overflow-x:auto; padding:10px 12px; background:rgba(255,255,255,.85); z-index:30;
      touch-action:pan-x; box-shadow:0 -3px 10px rgba(0,0,0,.12);`;
    ITEMS.forEach(em => {
      const b = document.createElement('div');
      b.textContent = em;
      b.style.cssText = 'font-size:46px; line-height:1; padding:4px; cursor:grab; touch-action:none; flex:0 0 auto;';
      b.addEventListener('pointerdown', e => startDrag(e, em, null));
      bar.appendChild(b);
    });
    stage.appendChild(bar);

    /* Gespeicherte Gartenteile aufbauen */
    function spawnSprite(item) {
      const el = document.createElement('div');
      el.className = 'sprite tappable';
      el.textContent = item.emoji;
      el.style.fontSize = item.size + 'px';
      el.style.zIndex = Math.floor(item.y * 10) + 10;
      el.style.transform = `translate(${item.x * stage.clientWidth - item.size / 2}px, ${item.y * stage.clientHeight}px)`;
      el.addEventListener('pointerdown', e => startDrag(e, item.emoji, item));
      stage.appendChild(el);
      item.el = el;
      return item;
    }
    saved.forEach(spawnSprite);

    function persist() {
      Storage.set('garten.items', saved.map(({ emoji, x, y, size }) => ({ emoji, x, y, size })));
    }

    /* Drag: neues Item aus der Leiste oder bestehendes verschieben */
    let drag = null;
    function startDrag(e, emoji, existing) {
      e.preventDefault();
      e.stopPropagation();
      if (drag) return;
      Sound.play('tap');
      let item = existing;
      if (!item) {
        item = spawnSprite({ emoji, x: 0.5, y: 0.5, size: 40 + Math.floor(Math.random() * 24) });
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
      drag.y = Math.min(Math.max((y - 20) / r.height, 0.30), 0.88);
      drag.el.style.transform = `translate(${drag.x * r.width - drag.size / 2}px, ${drag.y * r.height}px)`;
      // Mülleimer-Feedback
      const t = trash.getBoundingClientRect();
      const overTrash = e.clientX > t.left - 20 && e.clientX < t.right + 20 && e.clientY > t.top - 20 && e.clientY < t.bottom + 20;
      trash.style.transform = overTrash ? 'scale(1.35) rotate(-8deg)' : '';
      drag.overTrash = overTrash;
    }
    function onMove(e) { moveTo(e); }
    function onUp(e) {
      if (!drag) return;
      const r = stage.getBoundingClientRect();
      if (drag.overTrash) {
        Sound.play('whoosh');
        api.burst(drag.x * r.width, drag.y * r.height, ['💨', '✨'], 6, 22);
        drag.el.remove();
        saved = saved.filter(i => i !== drag);
      } else {
        Sound.play('pop');
        drag.el.style.zIndex = Math.floor(drag.y * 10) + 10;
        api.burst(drag.x * r.width, drag.y * r.height + 20, ['✨'], 4, 16);
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
