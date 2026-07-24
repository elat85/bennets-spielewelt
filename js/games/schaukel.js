/* Schaukeln: Im Takt tippen, um Schwung zu holen.
   Richtig hoch schaukeln = Regenbogen und 1 Stern. */
(window.GameModules = window.GameModules || {}).schaukel = {
  title: 'Schaukeln',
  tileClass: 'tile-schaukel',

  start(stage, api) {
    stage.style.background = 'linear-gradient(180deg, #6ec3f5 0%, #b5e3ff 55%, #93cf62 78%, #7ec850 100%)';

    const rainbowSvg = `
      <svg viewBox="0 0 300 160" style="width:100%; height:100%;">
        <g fill="none" stroke-linecap="round">
          <path d="M20 160 A130 130 0 0 1 280 160" stroke="#ff5252" stroke-width="16"/>
          <path d="M38 160 A112 112 0 0 1 262 160" stroke="#ffa726" stroke-width="16"/>
          <path d="M56 160 A94 94 0 0 1 244 160" stroke="#ffee58" stroke-width="16"/>
          <path d="M74 160 A76 76 0 0 1 226 160" stroke="#66bb6a" stroke-width="16"/>
          <path d="M92 160 A58 58 0 0 1 208 160" stroke="#4fc3f7" stroke-width="16"/>
          <path d="M110 160 A40 40 0 0 1 190 160" stroke="#ab47bc" stroke-width="16"/>
        </g>
      </svg>`;

    stage.innerHTML = Art.meadowScene({
      sunPos: 'left',
      extras: `<div id="sw-rainbow" style="position:absolute; left:calc(50% - clamp(120px,19vw,180px)); top:4%;
        width:clamp(240px,38vw,360px); aspect-ratio:300/160; opacity:0; transition:opacity .6s;">${rainbowSvg}</div>`
    });

    const ROPE = Math.min(300, stage.clientHeight * 0.45);

    // Gestell
    const frame = document.createElement('div');
    frame.style.cssText = 'position:absolute; inset:0; pointer-events:none; z-index:5;';
    frame.innerHTML = `
      <div style="position:absolute; left:50%; top:14%; width:${ROPE * 1.15}px; height:18px;
        background:linear-gradient(#8d6748,#6b4b3a); border-radius:9px; transform:translateX(-50%);
        box-shadow:inset 0 3px 0 rgba(255,255,255,.2), 0 4px 6px rgba(0,0,0,.25);"></div>
      <div style="position:absolute; left:calc(50% - ${ROPE * 0.52}px); top:14%; width:16px; height:${ROPE * 1.28}px;
        background:linear-gradient(90deg,#8d6748,#75543f); border-radius:8px; transform:rotate(12deg); transform-origin:top center;
        box-shadow:inset 2px 0 0 rgba(255,255,255,.15);"></div>
      <div style="position:absolute; left:calc(50% + ${ROPE * 0.52}px); top:14%; width:16px; height:${ROPE * 1.28}px;
        background:linear-gradient(90deg,#8d6748,#75543f); border-radius:8px; transform:rotate(-12deg); transform-origin:top center;
        box-shadow:inset 2px 0 0 rgba(255,255,255,.15);"></div>`;
    stage.appendChild(frame);

    // Schaukel (dreht um den Aufhängepunkt)
    const swing = document.createElement('div');
    swing.style.cssText = `position:absolute; left:50%; top:calc(14% + 9px); width:0; height:0;
      z-index:6; will-change:transform;`;
    swing.innerHTML = `
      <div style="position:absolute; left:-32px; top:0; width:7px; height:${ROPE}px; background:linear-gradient(90deg,#a5784e,#8d6748); border-radius:4px;"></div>
      <div style="position:absolute; left:25px;  top:0; width:7px; height:${ROPE}px; background:linear-gradient(90deg,#a5784e,#8d6748); border-radius:4px;"></div>
      <div style="position:absolute; left:-46px; top:${ROPE}px; width:92px; height:16px;
        background:linear-gradient(#e05d4b,#b23a2c); border:3px solid #8d2b20; border-radius:8px;
        box-shadow:inset 0 3px 0 rgba(255,255,255,.3), 0 4px 5px rgba(0,0,0,.3);"></div>
      <div style="position:absolute; left:-44px; top:${ROPE - 102}px; width:88px; height:97px;
        filter:drop-shadow(0 3px 4px rgba(0,0,0,.25));">${Art.kid('sit')}</div>`;
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
      api.setProgress(api.starRow(level(), 5));
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
        api.burst(stage.clientWidth / 2, stage.clientHeight * 0.22, ['rainbowdot', 'sparkle'], 10, 30);
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
