/* Synthetisierte Soundeffekte über die Web Audio API – keine Audiodateien nötig.
   AudioContext darf erst nach einer Nutzergeste starten (Browser-Vorgabe),
   deshalb lazy-Init beim ersten play(). */
const Sound = (() => {
  let ctx = null;
  let muted = Storage.get('muted', false);

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.25, slide = 0, delay = 0 } = {}) {
    const c = ac();
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, { vol = 0.2, delay = 0, freq = 1000 } = {}) {
    const c = ac();
    const t0 = c.currentTime + delay;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t0);
  }

  const effects = {
    pop()     { tone(500, 0.1, { type: 'sine', slide: 300 }); },
    tap()     { tone(320, 0.06, { type: 'triangle', vol: 0.15 }); },
    chomp()   { noise(0.08, { freq: 400, vol: 0.3 }); tone(160, 0.12, { type: 'sawtooth', vol: 0.2, slide: -80 }); noise(0.08, { freq: 300, vol: 0.25, delay: 0.12 }); },
    cluck()   { tone(700, 0.06, { type: 'square', vol: 0.12, slide: 200 }); tone(550, 0.08, { type: 'square', vol: 0.1, slide: -150, delay: 0.09 }); },
    boing()   { tone(150, 0.3, { type: 'sine', vol: 0.3, slide: 250 }); },
    whoosh()  { noise(0.25, { freq: 1600, vol: 0.15 }); },
    giggle()  { [900, 1100, 950, 1200].forEach((f, i) => tone(f, 0.07, { type: 'triangle', vol: 0.14, delay: i * 0.08 })); },
    ding()    { tone(880, 0.4, { type: 'triangle', vol: 0.2 }); },
    sparkle() { [1568, 1976, 2349].forEach((f, i) => tone(f, 0.15, { type: 'sine', vol: 0.12, delay: i * 0.05 })); },
    yay()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { type: 'triangle', vol: 0.2, delay: i * 0.1 })); },
    star()    { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, { type: 'sine', vol: 0.18, delay: i * 0.09 })); noise(0.4, { freq: 3000, vol: 0.05, delay: 0.3 }); },
    wrong()   { tone(220, 0.15, { type: 'sine', vol: 0.12, slide: -60 }); },
    splash()  { noise(0.3, { freq: 800, vol: 0.2 }); },
    creak()   { tone(180, 0.15, { type: 'sawtooth', vol: 0.05, slide: 40 }); },
    wind()    { noise(0.5, { freq: 600, vol: 0.08 }); }
  };

  return {
    play(name) {
      if (muted || !effects[name]) return;
      try { effects[name](); } catch (e) { /* Audio darf nie das Spiel stoppen */ }
    },
    toggleMute() {
      muted = !muted;
      Storage.set('muted', muted);
      return muted;
    },
    isMuted() { return muted; }
  };
})();
