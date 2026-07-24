/* Schaukeln: Im Takt tippen, um Schwung zu holen.
   Richtig hoch schaukeln = Regenbogen und 1 Stern. */
(window.GameModules = window.GameModules || {}).schaukel = {
  title: 'Schaukeln',
  icon: '🧒',
  tileClass: 'tile-schaukel',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #81d4fa 0%, #b3e5fc 55%, #aed581 78%, #7cb342 100%)';

    stage.innerHTML += `
      <div class="sprite" style="left:6%; top:6%; font-size:64px;">🌞</div>
      <div class="sprite" style="top:14%; font-size:56px; animation:float-cloud 42s linear infinite;">☁️</div>
      <div class="sprite" style="left:4%; bottom:4%; font-size:90px;">🌳</div>
      <div class="sprite" style="right:3%; bottom:5%; font-size:80px;">🌳</div>
      <div class="sprite" id="sw-rainbow" style="left:calc(50% - 80px); top:6%; font-size:160px; opacity:0; transition:opacity .6s; z-index:2;">🌈</div>`;

    const W = () => stage.clientWidth;
    const ROPE = Math.min(300, stage.clientHeight * 0.45);

    // Gestell
    const frame = document.createElement('div');
    frame.style.cssText = 'position:absolute; inset:0; pointer-events:none; z-index:5;';
    frame.innerHTML = `
      <div style="position:absolute; left:50%; top:14%; width:${ROPE * 1.15}px; height:16px; background:#6d4c41; border-radius:8px; transform:translateX(-50%); box-shadow:0 3px 4px rgba(0,0,0,.2);"></div>
      <div style="position:absolute; left:calc(50% - ${ROPE * 0.52}px); top:14%; width:14px; height:${ROPE * 1.25}px; background:#795548; border-radius:7px; transform:rotate(12deg); transform-origin:top center;"></div>
      <div style="position:absolute; left:calc(50% + ${ROPE * 0.52}px); top:14%; width:14px; height:${ROPE * 1.25}px; background:#795548; border-radius:7px; transform:rotate(-12deg); transform-origin:top center;"></div>`;
    stage.appendChild(frame);

    // Schaukel (dreht um den Aufhängepunkt)
    const swing = document.createElement('div');
    swing.style.cssText = `position:absolute; left:50%; top:calc(14% + 8px); width:0; height:0;
      z-index:6; will-change:transform;`;
    swing.innerHTML = `
      <div style="position:absolute; left:-30px; top:0; width:6px; height:${ROPE}px; background:#8d6e63; border-radius:3px;"></div>
      <div style="position:absolute; left:24px;  top:0; width:6px; height:${ROPE}px; background:#8d6e63; border-radius:3px;"></div>
      <div style="position:absolute; left:-42px; top:${ROPE}px; width:84px; height:14px; background:linear-gradient(#e53935,#b71c1c); border-radius:7px; box-shadow:0 3px 4px rgba(0,0,0,.25);"></div>
      <div style="position:absolute; left:-32px; top:${ROPE - 58}px; font-size:64px; line-height:1;">🧒</div>`;
    stage.appendChild(swing);

    let theta = 0.12;   // Auslenkung in rad
    let omega = 0;      // Winkelgeschwindigkeit
    let maxAmp = 0;
    let running = true;
    let lastSide = 0;
    let starCooldown = 0;
    const rainbow = stage.querySelector('#sw-rainbow');

    function level() {
      return Math.min(5, Math.floor((maxAmp / 1.22) * 5)); // 1.22 rad ≈ 70°
    }
    function updateProgress() {
      const l = level();
      api.setProgress('⭐'.repeat(l) + '☆'.repeat(5 - l));
    }
    updateProgress();

    function onTap() {
      // Anschubsen in Bewegungsrichtung; im Stillstand: anstoßen
      const dir = Math.abs(omega) > 0.05 ? Math.sign(omega) : (theta <= 0 ? 1 : -1);
      omega += dir * 0.38;
      Sound.play('whoosh');
    }
    stage.addEventListener('pointerdown', onTap);

    let last = performance.now();
    let raf;
    function loop(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;

      const gL = 4.2;      // g/L – bestimmt das Schaukeltempo
      omega += (-gL * Math.sin(theta) - 0.18 * omega) * dt;
      theta += omega * dt;
      theta = Math.max(Math.min(theta, 1.45), -1.45);

      // Quietschen am Umkehrpunkt
      const side = theta > 0.08 ? 1 : theta < -0.08 ? -1 : 0;
      if (side !== 0 && side !== lastSide && Math.abs(theta) > 0.25) {
        Sound.play('creak');
        lastSide = side;
      }

      const amp = Math.abs(theta);
      if (amp > maxAmp + 0.01) {
        maxAmp = amp;
        updateProgress();
      }

      // Hoch genug? Regenbogen + Stern!
      if (amp > 1.22 && now > starCooldown) {
        starCooldown = now + 9000;
        rainbow.style.opacity = '1';
        api.burst(W() / 2, stage.clientHeight * 0.2, ['🌈', '✨', '🦋'], 10, 32);
        Sound.play('yay');
        api.awardStar();
        maxAmp = 0;
        omega *= 0.4; // sanft neue Runde starten
        setTimeout(() => rainbow.style.opacity = '0', 3000);
      }

      swing.style.transform = `rotate(${theta * 180 / Math.PI}deg)`;
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onTap);
    };
  }
};
