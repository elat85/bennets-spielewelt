/* Hühner füttern: Tippen streut Körner, Hühner rennen hin und picken.
   Ab und zu legt ein Huhn ein Ei – antippen zum Einsammeln. 3 Eier = 1 Stern. */
(window.GameModules = window.GameModules || {}).huehner = {
  title: 'Hühner füttern',
  icon: '🐔',
  tileClass: 'tile-huehner',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #aee3ff 0%, #d8f3ff 35%, #b8e06a 35%, #8bc34a 100%)';

    // Deko: Sonne, Stall, Zaun
    const deco = document.createElement('div');
    deco.innerHTML = `
      <div class="sprite" style="right:6%; top:4%; font-size:70px;">🌞</div>
      <div class="sprite" style="left:4%; top:12%; font-size:80px;">🏠</div>
      <div class="sprite" style="left:0; right:0; top:31%; font-size:34px; letter-spacing:-6px; overflow:hidden; white-space:nowrap;">${'🪵'.repeat(40)}</div>`;
    stage.appendChild(deco);

    const chickens = [];
    const corns = [];
    let eggs = 0;
    let eaten = 0;
    let running = true;

    const W = () => stage.clientWidth;
    const H = () => stage.clientHeight;
    const GROUND_TOP = 0.42; // Hühner laufen nur auf der Wiese

    function updateProgress() {
      api.setProgress(`🥚 ${eggs} / 3`);
    }
    updateProgress();

    function makeChicken(i) {
      const el = document.createElement('div');
      el.className = 'sprite';
      el.textContent = '🐔';
      el.style.fontSize = '58px';
      el.style.zIndex = 10;
      stage.appendChild(el);
      return {
        el,
        x: Math.random() * (W() - 80) + 20,
        y: (GROUND_TOP + Math.random() * (1 - GROUND_TOP - 0.12)) * H(),
        tx: 0, ty: 0,
        speed: 90 + Math.random() * 50,
        state: 'wander',
        waitUntil: performance.now() + i * 400,
        peckUntil: 0,
        dir: 1
      };
    }
    for (let i = 0; i < 4; i++) chickens.push(makeChicken(i));
    chickens.forEach(c => pickWanderTarget(c));

    function pickWanderTarget(c) {
      c.tx = Math.random() * (W() - 80) + 20;
      c.ty = (GROUND_TOP + Math.random() * (1 - GROUND_TOP - 0.12)) * H();
    }

    // Körner streuen
    function onTap(e) {
      const r = stage.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (y < GROUND_TOP * H() - 20) return; // nur auf der Wiese
      Sound.play('pop');
      const n = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const corn = document.createElement('div');
        corn.className = 'sprite anim-pop';
        corn.textContent = '🌽';
        corn.style.fontSize = '20px';
        const cx = Math.min(Math.max(x + (Math.random() - 0.5) * 110, 10), W() - 20);
        const cy = Math.min(Math.max(y + (Math.random() - 0.5) * 70, GROUND_TOP * H()), H() - 25);
        corn.style.transform = `translate(${cx}px, ${cy}px)`;
        stage.appendChild(corn);
        corns.push({ el: corn, x: cx, y: cy, claimed: false });
      }
    }
    stage.addEventListener('pointerdown', onTap);

    function layEgg(x, y) {
      const egg = document.createElement('div');
      egg.className = 'sprite tappable anim-pop';
      egg.textContent = '🥚';
      egg.style.fontSize = '34px';
      egg.style.zIndex = 5;
      egg.style.transform = `translate(${x}px, ${y + 12}px)`;
      stage.appendChild(egg);
      Sound.play('pop');
      egg.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        Sound.play('ding');
        api.burst(x, y, ['✨', '⭐'], 6, 24);
        egg.remove();
        eggs++;
        if (eggs >= 3) {
          api.awardStar();
          eggs = 0;
        }
        updateProgress();
      });
    }

    let last = performance.now();
    let raf;
    function loop(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      for (const c of chickens) {
        if (now < c.waitUntil) { render(c); continue; }

        // freies Korn suchen – aber nur, wenn das Huhn noch keins im Blick hat
        if (c.corn && !c.corn.el.isConnected) c.corn = null;
        if (c.state !== 'peck' && !c.corn) {
          let best = null, bestD = Infinity;
          for (const corn of corns) {
            if (corn.claimed) continue;
            const d = Math.hypot(corn.x - c.x, corn.y - c.y);
            if (d < bestD) { bestD = d; best = corn; }
          }
          if (best) {
            best.claimed = true;
            c.corn = best;
            c.state = 'chase';
            c.tx = best.x; c.ty = best.y;
          }
        }

        if (c.state === 'peck') {
          if (now > c.peckUntil) {
            c.state = 'wander';
            c.el.style.rotate = '';
            pickWanderTarget(c);
            c.waitUntil = now + 400 + Math.random() * 1200;
          }
          render(c);
          continue;
        }

        const dx = c.tx - c.x, dy = c.ty - c.y;
        const dist = Math.hypot(dx, dy);
        const speed = c.state === 'chase' ? c.speed * 1.8 : c.speed * 0.6;
        if (dist > 6) {
          c.x += (dx / dist) * speed * dt;
          c.y += (dy / dist) * speed * dt;
          c.dir = dx >= 0 ? 1 : -1;
        } else if (c.state === 'chase' && c.corn) {
          // Picken!
          if (c.corn.el.isConnected) {
            c.corn.el.remove();
            const idx = corns.indexOf(c.corn);
            if (idx >= 0) corns.splice(idx, 1);
            Sound.play('cluck');
            api.burst(c.x + 20, c.y + 20, ['✨'], 3, 16);
            eaten++;
            if (Math.random() < 0.25) layEgg(c.x, c.y + 30);
          }
          c.corn = null;
          c.state = 'peck';
          c.peckUntil = now + 500;
          c.el.style.rotate = '25deg';
        } else if (c.state === 'wander') {
          pickWanderTarget(c);
          c.waitUntil = now + 600 + Math.random() * 2000;
        }
        render(c);
      }
      raf = requestAnimationFrame(loop);
    }

    function render(c) {
      const bob = c.state === 'chase' ? Math.sin(performance.now() / 60) * 4 : 0;
      // Emoji 🐔 schaut nach links → bei Laufrichtung rechts spiegeln
      c.el.style.transform = `translate(${c.x}px, ${c.y + bob}px) scaleX(${c.dir === 1 ? -1 : 1})`;
      c.el.style.zIndex = Math.floor(c.y);
    }

    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onTap);
    };
  }
};
