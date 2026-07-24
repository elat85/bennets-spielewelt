/* Trampolin: Tippen gibt Schwung für den nächsten Absprung.
   Je mehr Schwung, desto höher – ab großer Höhe gibt es Saltos.
   Bis ganz nach oben zur Sonne hüpfen = 1 Stern. */
(window.GameModules = window.GameModules || {}).trampolin = {
  title: 'Trampolin',
  tileClass: 'tile-trampolin',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #4aa8e8 0%, #8fd0f5 30%, #c8e9fb 62%, #93cf62 88%, #7ec850 100%)';
    stage.innerHTML = `
      <div class="art-layer" style="position:absolute; inset:0; pointer-events:none; z-index:0;">
        <div id="tr-sun" class="anim-pulse" style="position:absolute; left:calc(50% - clamp(45px,7vw,65px)); top:2%; width:clamp(90px,14vw,130px); aspect-ratio:1;">${Art.sun()}</div>
        <div style="position:absolute; top:20%; width:clamp(90px,13vw,150px); aspect-ratio:16/9; animation:float-cloud 40s linear infinite;">${Art.cloud()}</div>
        <div style="position:absolute; top:38%; width:clamp(70px,10vw,120px); aspect-ratio:16/9; animation:float-cloud 58s linear infinite; animation-delay:-22s;">${Art.cloud()}</div>
        <div style="position:absolute; top:56%; width:clamp(60px,9vw,100px); aspect-ratio:16/9; animation:float-cloud 48s linear infinite; animation-delay:-38s; opacity:.8;">${Art.cloud()}</div>
        <div style="position:absolute; left:0; right:0; bottom:4%; height:12%;">${Art.hills('#8cc95e', 1)}</div>
        <div style="position:absolute; left:2%; bottom:4%; width:clamp(70px,10vw,120px); aspect-ratio:120/150;">${Art.tree()}</div>
        <div style="position:absolute; right:2%; bottom:4%; width:clamp(80px,11vw,140px); aspect-ratio:140/80;">${Art.bush()}</div>
      </div>`;

    // Trampolin
    const tramp = document.createElement('div');
    tramp.style.cssText = 'position:absolute; left:50%; transform:translateX(-50%); bottom:5%; z-index:10; text-align:center;';
    tramp.innerHTML = `
      <div id="tr-mat" style="width:min(280px,42vw); height:28px;
        background:linear-gradient(180deg,#5adcc6,#1e9a86); border:4px solid #147a6a;
        border-radius:50%; box-shadow:inset 0 4px 0 rgba(255,255,255,.35), 0 5px 0 #0d5c50; transition:transform .1s;"></div>
      <div style="display:flex; justify-content:space-between; width:min(230px,35vw); margin:-2px auto 0;">
        <div style="width:11px; height:48px; background:linear-gradient(#607d8b,#455a64); border-radius:5px; transform:rotate(14deg);"></div>
        <div style="width:11px; height:48px; background:linear-gradient(#607d8b,#455a64); border-radius:5px; transform:rotate(-14deg);"></div>
      </div>`;
    stage.appendChild(tramp);
    const mat = tramp.querySelector('#tr-mat');

    // Kind + Schatten
    const shadow = document.createElement('div');
    shadow.className = 'char-shadow';
    shadow.style.cssText = 'left:calc(50% - 45px); width:90px; height:20px; z-index:9;';
    stage.appendChild(shadow);
    const kid = document.createElement('div');
    kid.className = 'sprite';
    kid.innerHTML = Art.kid('jump');
    kid.style.cssText = 'left:calc(50% - 45px); width:90px; height:99px; z-index:12; filter:drop-shadow(0 4px 4px rgba(0,0,0,.2));';
    stage.appendChild(kid);

    const H = () => stage.clientHeight;
    const KID = 99;
    const matY = () => H() - H() * 0.05 - 48 - 24; // Oberkante Sprungtuch

    let y = matY() - KID;   // Oberkante des Kindes
    let vy = 0;
    let bounceV = 750;      // aktueller Schwung
    const BASE_V = 750, MAX_V = 2350;
    let tapsSinceBounce = 0;
    let spin = 0, spinning = false;
    let squashUntil = 0;
    let running = true;
    let starCooldown = 0;

    function level() {
      return Math.min(5, Math.floor((bounceV - BASE_V) / ((MAX_V - BASE_V) / 5)));
    }
    function updateProgress() {
      api.setProgress(api.starRow(level(), 5));
    }
    updateProgress();

    function onTap() {
      tapsSinceBounce++;
      Sound.play('tap');
      kid.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,.2)) brightness(1.25)';
      setTimeout(() => kid.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,.2))', 120);
    }
    stage.addEventListener('pointerdown', onTap);

    let last = performance.now();
    let raf;
    function loop(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const g = 2400;

      vy += g * dt;
      y += vy * dt;

      // Aufprall aufs Sprungtuch
      if (y + KID >= matY() && vy > 0) {
        y = matY() - KID;
        if (tapsSinceBounce > 0) {
          bounceV = Math.min(bounceV + Math.min(tapsSinceBounce, 4) * 110, MAX_V);
        } else {
          bounceV = Math.max(bounceV * 0.9, BASE_V);
        }
        tapsSinceBounce = 0;
        vy = -bounceV;
        Sound.play('boing');
        mat.style.transform = 'scaleY(1.6) translateY(7px)';
        setTimeout(() => mat.style.transform = '', 110);
        squashUntil = now + 130;
        spinning = bounceV > 1500;
        spin = 0;
        updateProgress();
      }

      // Salto bei viel Schwung
      if (spinning && vy < 0) {
        spin += 400 * dt;
      } else if (spinning && vy > 0 && spin > 0) {
        spin = Math.min(spin + 400 * dt, 360);
      }
      if (y + KID >= matY() - 4) spin = 0;

      // Sonne erreicht?
      if (y < H() * 0.14 && now > starCooldown) {
        starCooldown = now + 8000;
        api.burst(stage.clientWidth / 2, H() * 0.12, ['sparkle', 'rainbowdot'], 12, 34);
        Sound.play('yay');
        api.awardStar();
        bounceV = BASE_V; // neue Runde
      }

      // Squash & Stretch: gestaucht beim Absprung, gestreckt im Flug
      const squash = now < squashUntil ? 'scale(1.18, .78)' : (Math.abs(vy) > 900 ? 'scale(.94, 1.08)' : 'scale(1,1)');
      kid.style.transform = `translateY(${y}px) rotate(${spin}deg) ${squash}`;
      // Schatten: klein und blass, wenn das Kind hoch fliegt
      const hFrac = 1 - Math.min(Math.max((matY() - KID - y) / (H() * 0.8), 0), 1);
      shadow.style.transform = `translateY(${matY() - 8}px) scale(${0.55 + hFrac * 0.45})`;
      shadow.style.opacity = 0.35 + hFrac * 0.65;
      raf = requestAnimationFrame(loop);
    }
    // Kind startet mit kleinem Hüpfer
    vy = -BASE_V;
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onTap);
    };
  }
};
