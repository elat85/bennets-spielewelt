/* Hühner füttern: Tippen streut Körner, Hühner rennen hin und picken.
   Ab und zu legt ein Huhn ein Ei – antippen zum Einsammeln. 3 Eier = 1 Stern. */
(window.GameModules = window.GameModules || {}).huehner = {
  title: 'Hühner füttern',
  tileClass: 'tile-huehner',

  start(stage, api) {
    stage.style.background = '#93cf62';
    stage.innerHTML = Art.scene('img/scenes/huehner.webp');

    const chickens = [];
    const corns = [];
    let eggs = 0;
    let eaten = 0;
    let running = true;

    const W = () => stage.clientWidth;
    const H = () => stage.clientHeight;

    /* Die Wiese beginnt im Szenenbild bei 0,60 (im Bild nachgemessen). Wo diese
       Linie auf der Bühne landet, hängt vom Seitenverhältnis ab: vorher stand
       hier 0.55 relativ zur BÜHNE, die echte Wiesenkante lag auf einem
       2,17:1-Handy aber bei 80 % — die Hühner liefen im Zaun und teilweise
       unterhalb des Bildschirmrands.

       Zwei Schritte: Szene so ausrichten, dass die Wiesenkante überall auf
       45 % der Bühnenhöhe sitzt, und danach alle Positionen aus der
       Szenen-Geometrie statt aus Bühnen-Prozenten rechnen. */
    const MEADOW_IN_SCENE = 0.60;
    const MEADOW_ON_STAGE = 0.45;
    const anchor = () => Art.sceneAnchor(stage, MEADOW_IN_SCENE, MEADOW_ON_STAGE);
    function applyAnchor() {
      const img = stage.querySelector('.scene-layer img');
      if (img) img.style.objectPosition = `center ${(anchor() * 100).toFixed(1)}%`;
    }
    applyAnchor();
    window.addEventListener('resize', applyAnchor);

    const geom = () => Art.sceneGeom(stage, anchor());
    const chickenSize = () => geom().len(0.075);
    const groundTop = () => Math.max(geom().y(MEADOW_IN_SCENE), 0);
    // Untergrenze so, dass das ganze Huhn sichtbar bleibt
    const groundBottom = () => H() - chickenSize() * 1.15;
    const randY = () => {
      const a = groundTop(), b = groundBottom();
      return b > a ? a + Math.random() * (b - a) : Math.max(0, b);
    };

    function updateProgress() {
      api.setProgress(`<span class="icon" style="width:1.1em; height:1.3em;">${Art.egg()}</span>&nbsp;${eggs} / 3`);
    }
    updateProgress();

    function makeChicken(i) {
      const size = Math.round(chickenSize() * (0.92 + Math.random() * 0.2));
      const shadow = document.createElement('div');
      shadow.className = 'char-shadow';
      shadow.style.width = size * 0.8 + 'px';
      shadow.style.height = size * 0.22 + 'px';
      stage.appendChild(shadow);
      const el = document.createElement('div');
      el.className = 'sprite';
      el.innerHTML = Art.charImg('img/chars/huhn-1.webp');
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.zIndex = 10;
      stage.appendChild(el);
      return {
        el, img: el.querySelector('img'), frame: 1, shadow, size,
        x: Math.random() * Math.max(W() - size - 40, 40) + 20,
        y: randY(),
        tx: 0, ty: 0,
        speed: 90 + Math.random() * 50,
        state: 'wander',
        waitUntil: performance.now() + i * 400,
        peckUntil: 0,
        corn: null,
        dir: 1
      };
    }
    for (let i = 0; i < 4; i++) chickens.push(makeChicken(i));
    chickens.forEach(c => pickWanderTarget(c));

    function pickWanderTarget(c) {
      c.tx = Math.random() * Math.max(W() - c.size - 40, 40) + 20;
      c.ty = randY();
    }

    // Körner streuen
    function onTap(e) {
      const r = stage.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (y < groundTop() - 20) return; // nur auf der Wiese
      Sound.play('pop');
      const cs = Math.round(chickenSize() * 0.46); // Korn passend zur Huhngröße
      const n = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const corn = document.createElement('div');
        corn.className = 'sprite';
        // Aufplopp-Animation auf einem INNEREN Element, sonst überschreibt
        // sie das translate() der Positionierung (Sprite klebt oben links)
        corn.innerHTML = `<div class="anim-pop" style="width:100%; height:100%; filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));">${Art.corn()}</div>`;
        corn.style.width = corn.style.height = cs + 'px';
        const cx = Math.min(Math.max(x + (Math.random() - 0.5) * 110, 10), W() - cs - 4);
        const cy = Math.min(Math.max(y + (Math.random() - 0.5) * 70, groundTop()), H() - cs - 6);
        corn.style.transform = `translate(${cx}px, ${cy}px)`;
        stage.appendChild(corn);
        corns.push({ el: corn, x: cx, y: cy, claimed: false });
      }
    }
    stage.addEventListener('pointerdown', onTap);

    function layEgg(x, y) {
      const egg = document.createElement('div');
      egg.className = 'sprite tappable';
      egg.innerHTML = `<div class="anim-pop" style="width:100%; height:100%; filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));">${Art.egg()}</div>`;
      const ew = Math.round(chickenSize() * 0.56);
      egg.style.width = ew + 'px';
      egg.style.height = Math.round(ew * 1.15) + 'px';
      egg.style.zIndex = 5;
      // innerhalb der Bühne halten, sonst liegt das Ei halb unter dem Rand
      const ey = Math.min(y + 14, H() - ew * 1.15 - 4);
      egg.style.transform = `translate(${Math.min(x, W() - ew - 4)}px, ${ey}px)`;
      stage.appendChild(egg);
      Sound.play('pop');
      egg.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        Sound.play('ding');
        api.buzz(15);
        api.burst(x, y, ['sparkle'], 6, 24);
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
            api.burst(c.x + 24, c.y + 24, ['sparkle'], 3, 16);
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
      const moving = c.state === 'chase' || (c.state === 'wander' && performance.now() >= c.waitUntil);
      // 2-Frame-Laufzyklus: stehendes / laufendes Huhn abwechseln
      const frame = moving ? (Math.floor(performance.now() / 150) % 2) + 1 : 1;
      if (frame !== c.frame) {
        c.frame = frame;
        c.img.src = `img/chars/huhn-${frame}.webp`;
      }
      const bob = c.state === 'chase' ? Math.sin(performance.now() / 60) * 4 : 0;
      // Die gezeichnete Henne schaut nach links → bei Laufrichtung rechts spiegeln
      c.el.style.transform = `translate(${c.x}px, ${c.y + bob}px) scaleX(${c.dir === 1 ? -1 : 1})`;
      c.el.style.zIndex = Math.floor(c.y);
      c.shadow.style.transform = `translate(${c.x + c.size * 0.1}px, ${c.y + c.size * 0.92}px)`;
    }

    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onTap);
      window.removeEventListener('resize', applyAnchor);
    };
  }
};
