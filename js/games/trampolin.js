/* Trampolin: Tippen gibt Schwung für den nächsten Absprung.
   Je mehr Schwung, desto höher – ab großer Höhe gibt es Saltos.
   Bis ganz nach oben zur Sonne hüpfen = 1 Stern. */
(window.GameModules = window.GameModules || {}).trampolin = {
  title: 'Trampolin',
  icon: '🤸',
  tileClass: 'tile-trampolin',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #ffd54f 0%, #90caf9 18%, #bbdefb 55%, #e3f2fd 78%, #aed581 92%, #7cb342 100%)';

    // Deko: Sonne oben (Ziel), Wolken auf verschiedenen Höhen
    stage.innerHTML += `
      <div class="sprite anim-pulse" id="tr-sun" style="left:calc(50% - 40px); top:2%; font-size:80px; z-index:3;">🌞</div>
      <div class="sprite" style="top:22%; font-size:60px; animation:float-cloud 38s linear infinite;">☁️</div>
      <div class="sprite" style="top:40%; font-size:48px; animation:float-cloud 55s linear infinite; animation-delay:-20s;">☁️</div>
      <div class="sprite" style="top:58%; font-size:54px; animation:float-cloud 46s linear infinite; animation-delay:-35s;">🎈</div>`;

    // Trampolin
    const tramp = document.createElement('div');
    tramp.style.cssText = 'position:absolute; left:50%; transform:translateX(-50%); bottom:6%; z-index:10; text-align:center;';
    tramp.innerHTML = `
      <div id="tr-mat" style="width:min(260px,40vw); height:26px; background:linear-gradient(#4dd0e1,#0097a7);
        border-radius:50%; box-shadow:0 4px 0 #006064; transition:transform .1s;"></div>
      <div style="display:flex; justify-content:space-between; width:min(220px,34vw); margin:0 auto;">
        <div style="width:10px; height:44px; background:#455a64; border-radius:4px; transform:rotate(14deg);"></div>
        <div style="width:10px; height:44px; background:#455a64; border-radius:4px; transform:rotate(-14deg);"></div>
      </div>`;
    stage.appendChild(tramp);
    const mat = tramp.querySelector('#tr-mat');

    // Kind
    const kid = document.createElement('div');
    kid.className = 'sprite';
    kid.textContent = '🤸';
    kid.style.cssText = 'left:calc(50% - 35px); font-size:70px; z-index:12;';
    stage.appendChild(kid);

    const H = () => stage.clientHeight;
    const KID = 70;
    const matY = () => H() - H() * 0.06 - 44 - 20; // Oberkante Sprungtuch

    let y = matY() - KID;   // Oberkante des Kindes
    let vy = 0;
    let bounceV = 750;      // aktueller Schwung
    const BASE_V = 750, MAX_V = 2350;
    let tapsSinceBounce = 0;
    let spin = 0, spinning = false;
    let running = true;
    let starCooldown = 0;

    function level() {
      return Math.min(5, Math.floor((bounceV - BASE_V) / ((MAX_V - BASE_V) / 5)));
    }
    function updateProgress() {
      const l = level();
      api.setProgress('⭐'.repeat(l) + '☆'.repeat(5 - l));
    }
    updateProgress();

    function onTap() {
      tapsSinceBounce++;
      Sound.play('tap');
      kid.style.filter = 'brightness(1.3)';
      setTimeout(() => kid.style.filter = '', 120);
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
        mat.style.transform = 'scaleY(1.6) translateY(6px)';
        setTimeout(() => mat.style.transform = '', 110);
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
        api.burst(stage.clientWidth / 2, H() * 0.12, ['🌟', '✨', '🌈'], 12, 34);
        Sound.play('yay');
        api.awardStar();
        bounceV = BASE_V; // neue Runde
      }

      kid.style.transform = `translateY(${y}px) rotate(${spin}deg)`;
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
