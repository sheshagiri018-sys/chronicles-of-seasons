/* ═══════════════════════════════════════════════════════════════
   CHRONICLES OF SEASONS — MASTER SCRIPT
   Awwwards · Cinematic · Immersive · Interactive
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────
   GLOBALS & UTILITIES
───────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const isMobile = () => window.innerWidth < 768;
const PI2 = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
const randItem = arr => arr[Math.floor(Math.random() * arr.length)];

let mouseX = 0, mouseY = 0;
let currentSection = 'summer';
let soundEnabled = false;
let currentMood = 'calm';
let cosmosUnlocked = false;
let finaleTriggered = false;

/* ─────────────────────────────────────
   MOOD SELECTOR
───────────────────────────────────── */
(function initMood() {
  const screen = $('mood-screen');
  const btns   = $$('.mood-btn');
  const skip   = $('mood-skip');

  function chooseMood(mood) {
    currentMood = mood;
    document.body.classList.add('mood-' + mood);
    screen.classList.add('fade-out');
    setTimeout(() => { screen.classList.add('gone'); startLoader(); }, 1000);
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(() => chooseMood(btn.dataset.mood), 300);
    });
  });

  skip.addEventListener('click', () => chooseMood('calm'));
})();

/* ─────────────────────────────────────
   LOADER
───────────────────────────────────── */
function startLoader() {
  const loaderEl = $('loader');
  const bar      = $('loader-bar');
  const pct      = $('loader-percent');
  const lc       = $('loader-canvas');

  // Loader canvas — animated seasonal orbs
  const lctx = lc.getContext('2d');
  lc.width  = lc.offsetWidth  || window.innerWidth;
  lc.height = lc.offsetHeight || window.innerHeight;

  const loaderOrbs = Array.from({length: 5}, (_, i) => ({
    x: rand(0, lc.width), y: rand(0, lc.height),
    r: rand(80, 200), vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
    hue: [40, 220, 25, 200, 120][i],
    alpha: rand(0.04, 0.1)
  }));

  let loaderRunning = true;
  (function loaderAnim() {
    if (!loaderRunning) return;
    lc.width = lc.offsetWidth || window.innerWidth;
    lc.height = lc.offsetHeight || window.innerHeight;
    lctx.clearRect(0, 0, lc.width, lc.height);
    loaderOrbs.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.r) o.x = lc.width + o.r;
      if (o.x > lc.width + o.r) o.x = -o.r;
      if (o.y < -o.r) o.y = lc.height + o.r;
      if (o.y > lc.height + o.r) o.y = -o.r;
      const g = lctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.hue},80%,60%,${o.alpha})`);
      g.addColorStop(1, `hsla(${o.hue},80%,40%,0)`);
      lctx.beginPath();
      lctx.fillStyle = g;
      lctx.arc(o.x, o.y, o.r, 0, PI2);
      lctx.fill();
    });
    requestAnimationFrame(loaderAnim);
  })();

  // Progress counter
  let p = 0;
  const iv = setInterval(() => {
    p += rand(1.5, 4.5);
    if (p >= 100) { p = 100; clearInterval(iv); }
    bar.style.width = p + '%';
    pct.textContent = Math.floor(p) + '%';
  }, 60);

  setTimeout(() => {
    loaderRunning = false;
    loaderEl.classList.add('hidden');
    setTimeout(() => {
      loaderEl.style.display = 'none';
      initSite();
    }, 1200);
  }, 4200);
}

/* ─────────────────────────────────────
   SITE INIT (after loader)
───────────────────────────────────── */
function initSite() {
  initCursor();
  initCursorFX();
  initCompass();
  initSound();
  initProgress();
  initObserver();
  initQuoteChars();
  initTransitionCanvases();
  initSummerEngine();
  initRainEngine();
  initAutumnEngine();
  initWinterEngine();
  initSpringEngine();
  initFinaleEngine();
  initCosmosEngine();
  initEasterEggs();
  activateSection('summer');
  $('life-tracker').classList.add('visible');
}

/* ─────────────────────────────────────
   CURSOR
───────────────────────────────────── */
function initCursor() {
  const cursor = $('cursor');
  const trail  = $('cursor-trail');
  let tx = 0, ty = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  // Smooth trail
  (function trailLoop() {
    tx = lerp(tx, mouseX, 0.12);
    ty = lerp(ty, mouseY, 0.12);
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(trailLoop);
  })();

  // Click expand
  document.addEventListener('mousedown', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.6)');
  document.addEventListener('mouseup',   () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
}

/* ─────────────────────────────────────
   CURSOR FX CANVAS
   – particles that trail behind cursor
───────────────────────────────────── */
function initCursorFX() {
  const c   = $('cursor-fx-canvas');
  const ctx = c.getContext('2d');

  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  const particles = [];
  const SEASON_COLORS = {
    summer:  ['255,208,80', '255,160,40', '255,240,120'],
    rain:    ['100,180,255', '60,120,220', '180,220,255'],
    autumn:  ['220,100,30', '200,140,40', '255,160,60'],
    winter:  ['200,230,255', '160,200,240', '230,245,255'],
    spring:  ['160,230,160', '255,180,200', '200,255,200'],
    cosmos:  ['224,86,160', '123,47,190', '0,210,255'],
    finale:  ['255,200,80', '100,80,200', '80,200,140']
  };

  document.addEventListener('mousemove', () => {
    const cols = SEASON_COLORS[currentSection] || SEASON_COLORS.summer;
    if (Math.random() < 0.35) {
      particles.push({
        x: mouseX, y: mouseY,
        vx: rand(-1.5, 1.5), vy: rand(-2.5, -0.5),
        size: rand(2, 5), alpha: rand(0.5, 0.9),
        decay: rand(0.015, 0.03),
        color: randItem(cols)
      });
    }
  });

  (function fxLoop() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.06; // gravity
      p.alpha -= p.decay;
      p.size  *= 0.97;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, PI2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(fxLoop);
  })();
}

/* ─────────────────────────────────────
   SECTION ACTIVATION
───────────────────────────────────── */
const seasonColors = {
  summer: '#FFB347', rain: '#4A6FA5', autumn: '#D2691E',
  winter: '#B0C4DE', spring: '#7BC67E', finale: '#9B59B6', cosmos: '#E056A0'
};
const seasonNames = {
  summer: 'Summer', rain: 'Rain', autumn: 'Autumn',
  winter: 'Winter', spring: 'Spring', finale: 'Eternity', cosmos: 'Cosmos'
};
const progressGradients = {
  summer: 'linear-gradient(90deg,#FFB347,#FFD060)',
  rain:   'linear-gradient(90deg,#4A6FA5,#87CEEB)',
  autumn: 'linear-gradient(90deg,#D2691E,#FFB347)',
  winter: 'linear-gradient(90deg,#B0C4DE,#E8F4FD)',
  spring: 'linear-gradient(90deg,#7BC67E,#B8F0B8)',
  finale: 'linear-gradient(90deg,#9B59B6,#E056A0)',
  cosmos: 'linear-gradient(90deg,#7B2FBE,#E056A0,#00D2FF)'
};

function activateSection(id) {
  $$('section').forEach(s => s.classList.remove('active'));
  const sec = $(id);
  if (sec) sec.classList.add('active');
  currentSection = id;

  // Body class for cursor
  document.body.className = document.body.className
    .replace(/season-\w+/g, '').replace(/mood-\w+/g, '').trim();
  document.body.classList.add('season-' + id);
  if (currentMood) document.body.classList.add('mood-' + currentMood);

  updateWeatherIndicator(id);
  updateCompass(id);
  updateProgressGradient(id);

  // Frost
  $('frost-overlay').style.opacity = id === 'winter' ? '1' : '0';

  // Animate quote chars with stagger
  if (sec) {
    const chars = sec.querySelectorAll('.char');
    chars.forEach((ch, i) => {
      ch.style.transitionDelay = (0.9 + i * 0.025) + 's';
    });
  }
}

function updateWeatherIndicator(s) {
  const name  = $('wi-name');
  const bars  = $$('.wi-bar');
  const color = seasonColors[s] || '#fff';
  name.textContent = seasonNames[s] || s;
  name.style.color = color;
  bars.forEach(b => b.style.background = color);
}

function updateProgressGradient(s) {
  $('life-progress-bar').style.background = progressGradients[s] || progressGradients.summer;
}

/* ─────────────────────────────────────
   COMPASS
───────────────────────────────────── */
function initCompass() {
  $$('.compass-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const id = dot.dataset.section;
      const el = $(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function updateCompass(id) {
  $$('.compass-dot').forEach(d => {
    d.classList.toggle('active', d.dataset.section === id);
  });
}

/* ─────────────────────────────────────
   SCROLL PROGRESS
───────────────────────────────────── */
function initProgress() {
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    $('life-progress-bar').style.width = clamp(pct, 0, 100) + '%';
    $('tracker-pct').textContent = Math.floor(clamp(pct, 0, 100)) + '%';

    // Parallax on sun orb
    const sunOrb = $('sun-orb');
    if (sunOrb) sunOrb.style.transform = `translateX(-50%) translateY(${window.scrollY * 0.08}px)`;
  }, { passive: true });
}

/* ─────────────────────────────────────
   INTERSECTION OBSERVER
───────────────────────────────────── */
function initObserver() {
  const ids = ['summer','rain','autumn','winter','spring','finale','cosmos'];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.38) {
        activateSection(e.target.id);
        if (e.target.id === 'finale' && !finaleTriggered) {
          finaleTriggered = true;
          triggerFinaleSequence();
        }
      }
    });
  }, { threshold: 0.38 });
  ids.forEach(id => { const el = $(id); if (el) obs.observe(el); });
}

/* ─────────────────────────────────────
   QUOTE CHAR SPLITTING (animated text)
───────────────────────────────────── */
function initQuoteChars() {
  $$('.season-quote .char-wrap').forEach(wrap => {
    const text = wrap.textContent;
    wrap.innerHTML = '';
    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      span.style.transitionDelay = (0.9 + i * 0.022) + 's';
      wrap.appendChild(span);
    });
  });
}

/* ─────────────────────────────────────
   SOUND SYSTEM
   (Web Audio API — procedural ambient)
───────────────────────────────────── */
let audioCtx = null;
let activeNodes = [];

function initSound() {
  const btn = $('sound-btn');
  btn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      playSeasonAmbience(currentSection);
      btn.querySelector('.sound-wave-1').style.opacity = '1';
      btn.querySelector('.sound-wave-2').style.opacity = '1';
      btn.querySelector('.sound-mute-line').style.display = 'none';
    } else {
      stopAllSound();
      btn.querySelector('.sound-wave-1').style.opacity = '0.3';
      btn.querySelector('.sound-wave-2').style.opacity = '0.3';
      btn.querySelector('.sound-mute-line').style.display = 'block';
    }
  });
}

function stopAllSound() {
  activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
  activeNodes = [];
}

function playSeasonAmbience(season) {
  if (!soundEnabled || !audioCtx) return;
  stopAllSound();
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 2);
  masterGain.connect(audioCtx.destination);

  const configs = {
    summer:  [{ type:'sine',   freq:180, gain:0.15 }, { type:'sine',   freq:360, gain:0.08 }, { type:'triangle', freq:540, gain:0.05 }],
    rain:    [{ type:'sawtooth', freq:60, gain:0.06 }, { type:'sine',   freq:90,  gain:0.12 }, { type:'sine',   freq:200, gain:0.07 }],
    autumn:  [{ type:'triangle', freq:130, gain:0.12 }, { type:'sine', freq:260, gain:0.08 }],
    winter:  [{ type:'sine',   freq:110, gain:0.12 }, { type:'sine',   freq:220, gain:0.06 }, { type:'sine', freq:55, gain:0.08 }],
    spring:  [{ type:'sine',   freq:260, gain:0.1  }, { type:'triangle', freq:390, gain:0.08 }, { type:'sine', freq:520, gain:0.05 }],
    finale:  [{ type:'sine',   freq:80,  gain:0.08 }, { type:'sine',   freq:160, gain:0.06 }, { type:'triangle', freq:240, gain:0.04 }],
    cosmos:  [{ type:'sine',   freq:40,  gain:0.15 }, { type:'sine',   freq:60,  gain:0.1  }, { type:'sine', freq:90, gain:0.06 }]
  };

  const list = configs[season] || configs.summer;
  list.forEach(cfg => {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const lfo  = audioCtx.createOscillator();
    const lfoG = audioCtx.createGain();

    lfo.frequency.value  = rand(0.05, 0.3);
    lfoG.gain.value      = cfg.freq * 0.02;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start();

    osc.type            = cfg.type;
    osc.frequency.value = cfg.freq;
    gain.gain.value     = cfg.gain;
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    activeNodes.push(osc, lfo);
  });
}

// Switch ambience on section change
const _origActivate = activateSection;
// (Sound switching is integrated into activateSection calls below)

/* ─────────────────────────────────────
   TRANSITION CANVASES
───────────────────────────────────── */
function initTransitionCanvases() {
  makeTransition('trans1-canvas', 'summer-rain');
  makeTransition('trans2-canvas', 'rain-autumn');
  makeTransition('trans3-canvas', 'autumn-winter');
  makeTransition('trans4-canvas', 'winter-spring');
}

function makeTransition(canvasId, type) {
  const c = $(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const resize = () => { c.width = c.parentElement.offsetWidth; c.height = c.parentElement.offsetHeight; };
  window.addEventListener('resize', resize); resize();

  const particles = [];
  const COUNT = isMobile() ? 50 : 100;

  if (type === 'summer-rain') {
    // Golden sun rays dissolving into rain drops
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: rand(0, 1), y: rand(0, 0.4),
        vx: rand(-0.001, 0.001), vy: rand(0.001, 0.004),
        r: rand(30, 80), alpha: rand(0.03, 0.1),
        phase: rand(0, PI2), life: rand(0, 1), isRay: Math.random() < 0.4
      });
    }
  } else if (type === 'rain-autumn') {
    const leafCols = ['#D2691E','#FF8C00','#CD853F','#A0522D','#FFB347','#C4741A'];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: rand(0, 1), y: rand(-0.3, 1.2),
        vx: rand(-0.002, 0.003), vy: rand(0.002, 0.006),
        size: rand(6, 16), rot: rand(0, PI2), rotV: rand(-0.05, 0.05),
        wobble: rand(0, PI2), wobbleSpeed: rand(0.02, 0.06),
        color: randItem(leafCols), alpha: rand(0.4, 0.9),
        isRain: Math.random() < 0.3
      });
    }
  } else if (type === 'autumn-winter') {
    // Leaves freezing into snowflakes
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: rand(0, 1), y: rand(-0.5, 1.2),
        vx: rand(-0.001, 0.001), vy: rand(0.001, 0.003),
        size: rand(2, 6), wobble: rand(0, PI2), wobbleSpeed: rand(0.01, 0.04),
        alpha: rand(0.3, 0.8), type: Math.random() < 0.4 ? 'crystal' : 'dot'
      });
    }
  } else if (type === 'winter-spring') {
    // Snow melting into petals
    const petalCols = ['#FFB7D5','#FFD1DC','#FF99BB','#7BC67E','#FFD700'];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: rand(0, 1), y: rand(0, 1.5),
        vx: rand(-0.002, 0.002), vy: rand(-0.004, -0.001),
        size: rand(4, 12), rot: rand(0, PI2), rotV: rand(-0.04, 0.04),
        color: Math.random() < 0.5 ? randItem(petalCols) : 'rgba(210,230,255,0.8)',
        alpha: rand(0.4, 0.9), wobble: rand(0, PI2), wobbleSpeed: rand(0.02, 0.05)
      });
    }
  }

  const t = performance.now();
  (function loop(now) {
    const elapsed = (now - t) / 1000;
    c.width  = c.parentElement.offsetWidth;
    c.height = c.parentElement.offsetHeight;
    ctx.clearRect(0, 0, c.width, c.height);

    if (type === 'summer-rain') {
      particles.forEach(p => {
        p.phase += 0.01; p.y += p.vy; p.x += p.vx;
        if (p.y > 1.2) { p.y = -0.1; p.x = rand(0, 1); }
        const px = p.x * c.width, py = p.y * c.height;
        if (p.isRay) {
          const g = ctx.createRadialGradient(px, py, 0, px, py, p.r);
          g.addColorStop(0, `rgba(255,200,60,${p.alpha + Math.sin(p.phase)*0.03})`);
          g.addColorStop(1, 'rgba(255,150,0,0)');
          ctx.beginPath(); ctx.fillStyle = g;
          ctx.arc(px, py, p.r, 0, PI2); ctx.fill();
        } else {
          ctx.save();
          ctx.strokeStyle = `rgba(140,200,255,${p.alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(px + 2, py + 18);
          ctx.stroke(); ctx.restore();
        }
      });
    }
    else if (type === 'rain-autumn') {
      particles.forEach(p => {
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.001; p.y += p.vy;
        p.rot += p.rotV;
        if (p.y > 1.3) { p.y = -0.1; p.x = rand(0, 1); }
        const px = p.x * c.width, py = p.y * c.height;
        if (p.isRain) {
          ctx.save();
          ctx.strokeStyle = `rgba(140,200,255,${p.alpha * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(px + 2, py + 14);
          ctx.stroke(); ctx.restore();
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(px, py); ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.8, p.size * 0.9, 0, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.9, 0, -p.size * 0.8, -p.size * 0.8, 0, -p.size);
          ctx.fill(); ctx.restore();
        }
      });
    }
    else if (type === 'autumn-winter') {
      particles.forEach(p => {
        p.wobble += p.wobbleSpeed; p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 0.0008;
        if (p.y > 1.2) { p.y = -0.1; p.x = rand(0, 1); }
        const px = p.x * c.width, py = p.y * c.height;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.type === 'crystal') {
          ctx.strokeStyle = `rgba(200,225,255,${p.alpha})`;
          ctx.lineWidth = 0.7;
          for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(i / 6 * PI2);
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(0, -p.size * 2);
            ctx.moveTo(0, -p.size); ctx.lineTo(-p.size * 0.5, -p.size * 1.5);
            ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.5, -p.size * 1.5);
            ctx.stroke(); ctx.restore();
          }
        } else {
          ctx.fillStyle = `rgba(210,230,255,${p.alpha})`;
          ctx.beginPath(); ctx.arc(px, py, p.size, 0, PI2); ctx.fill();
        }
        ctx.restore();
      });
    }
    else if (type === 'winter-spring') {
      particles.forEach(p => {
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.001; p.y += p.vy;
        p.rot += p.rotV;
        if (p.y < -0.2) { p.y = 1.2; p.x = rand(0, 1); }
        const px = p.x * c.width, py = p.y * c.height;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(px, py); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.8, p.size * 0.8, 0, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, 0, -p.size * 0.7, -p.size * 0.8, 0, -p.size);
        ctx.fill(); ctx.restore();
      });
    }
    requestAnimationFrame(loop);
  })(performance.now());
}

/* ═══════════════════════════════════════
   ░░░  SEASON PARTICLE ENGINES  ░░░
═══════════════════════════════════════ */

/* ─────────────────────────────────────
   SUMMER ENGINE
   – Sun rays, dust, birds, heat ripples,
     cursor heat interaction
───────────────────────────────────── */
function initSummerEngine() {
  const c   = $('summer-canvas');
  const ic  = $('summer-interact');
  const ctx = c.getContext('2d');
  const ictx = ic.getContext('2d');

  const resize = () => {
    c.width = ic.width = c.offsetWidth;
    c.height = ic.height = c.offsetHeight;
  };
  window.addEventListener('resize', resize); resize();

  const N = isMobile() ? 80 : 200;
  const particles = [];

  // Dust motes + sun beams
  class SummerParticle {
    constructor() { this.reset(true); }
    reset(immediate) {
      this.x = rand(0, c.width);
      this.y = immediate ? rand(0, c.height) : c.height + 10;
      this.size  = rand(0.5, 3.5);
      this.vx    = rand(-0.4, 0.4);
      this.vy    = rand(-0.8, -0.2);
      this.alpha = rand(0.1, 0.7);
      this.life  = rand(0.4, 1);
      this.decay = rand(0.003, 0.008);
      this.isBeam = Math.random() < 0.18;
      this.beamAngle = rand(-0.3, 0.3) - Math.PI / 2;
      this.beamLen   = rand(60, 180);
    }
    update() {
      this.x   += this.vx; this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -20) this.reset(false);
      // Cursor push
      const rect = c.getBoundingClientRect();
      const dx = this.x - (mouseX - rect.left);
      const dy = this.y - (mouseY - rect.top);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        const f = (90 - dist) / 90 * 0.04;
        this.vx += dx * f; this.vy += dy * f;
      }
    }
    draw() {
      const a = this.life * this.alpha;
      if (this.isBeam) {
        const x2 = this.x + Math.cos(this.beamAngle) * this.beamLen;
        const y2 = this.y + Math.sin(this.beamAngle) * this.beamLen;
        const g  = ctx.createLinearGradient(this.x, this.y, x2, y2);
        g.addColorStop(0, `rgba(255,220,80,${a * 0.4})`);
        g.addColorStop(1, `rgba(255,140,0,0)`);
        ctx.save(); ctx.lineWidth = this.size * 0.6; ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(x2, y2);
        ctx.stroke(); ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, PI2);
        ctx.fillStyle = `rgba(255,${180 + randInt(0, 60)},${randInt(0, 40)},${a})`;
        ctx.fill();
      }
    }
  }

  // Birds
  const birds = Array.from({ length: isMobile() ? 4 : 10 }, () => ({
    x: rand(0, c.width), y: rand(30, c.height * 0.45),
    vx: rand(0.5, 2), size: rand(3, 7),
    wingAngle: rand(0, PI2), wingSpeed: rand(0.06, 0.14),
    waveAmp: rand(15, 40), waveOffset: rand(0, PI2)
  }));

  for (let i = 0; i < N; i++) particles.push(new SummerParticle());

  // Dynamic sun rays
  let rayAngle = 0;
  function drawSunRays() {
    const sx = c.width * 0.5, sy = -60;
    const rays = isMobile() ? 8 : 14;
    for (let i = 0; i < rays; i++) {
      const a   = (i / rays) * PI2 + rayAngle;
      const len = c.height * 2;
      const g   = ctx.createLinearGradient(sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      g.addColorStop(0, `rgba(255,210,60,${0.07 + Math.sin(rayAngle * 3 + i) * 0.02})`);
      g.addColorStop(0.6, `rgba(255,160,0,0.02)`);
      g.addColorStop(1, `rgba(255,120,0,0)`);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const sp = 0.07;
      ctx.lineTo(sx + Math.cos(a - sp) * len, sy + Math.sin(a - sp) * len);
      ctx.lineTo(sx + Math.cos(a + sp) * len, sy + Math.sin(a + sp) * len);
      ctx.closePath();
      ctx.fillStyle = g; ctx.fill();
    }
  }

  // Lens flare
  function drawLensFlare() {
    const rect = c.getBoundingClientRect();
    const mx = mouseX - rect.left;
    const my = mouseY - rect.top;
    const sx = c.width * 0.5, sy = -40;
    const dx = mx - sx, dy = my - sy;
    const positions = [0.3, 0.5, 0.7, 0.85, 1.1];
    positions.forEach((t, i) => {
      const fx = sx + dx * t, fy = sy + dy * t;
      const fr = [18, 8, 12, 5, 20][i];
      const g  = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      g.addColorStop(0, `rgba(255,240,180,0.12)`);
      g.addColorStop(1, `rgba(255,200,80,0)`);
      ctx.beginPath(); ctx.fillStyle = g;
      ctx.arc(fx, fy, fr, 0, PI2); ctx.fill();
    });
  }

  function drawBird(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.strokeStyle = `rgba(200,180,140,0.55)`;
    ctx.lineWidth   = 1.4;
    ctx.beginPath();
    const w = b.wingAngle;
    ctx.moveTo(-b.size * 2, 0);
    ctx.quadraticCurveTo(-b.size, -Math.sin(w) * b.size * 2.2, 0, 0);
    ctx.quadraticCurveTo(b.size,  -Math.sin(w) * b.size * 2.2, b.size * 2, 0);
    ctx.stroke(); ctx.restore();
  }

  // Heat ripples on interact canvas
  const heatRipples = [];
  ic.addEventListener('mousemove', e => {
    if (Math.random() < 0.06) {
      const r = ic.getBoundingClientRect();
      heatRipples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, alpha: 0.4 });
    }
  });

  function animate() {
    if (currentSection !== 'summer') { requestAnimationFrame(animate); return; }
    ctx.clearRect(0, 0, c.width, c.height);
    ictx.clearRect(0, 0, ic.width, ic.height);

    rayAngle += 0.0004;
    drawSunRays();
    drawLensFlare();
    particles.forEach(p => { p.update(); p.draw(); });
    birds.forEach(b => {
      b.x += b.vx;
      b.y += Math.sin(Date.now() * 0.0008 + b.waveOffset) * 0.25;
      b.wingAngle += b.wingSpeed;
      if (b.x > c.width + 40) { b.x = -40; b.y = rand(30, c.height * 0.45); }
      drawBird(b);
    });

    // Heat ripples
    for (let i = heatRipples.length - 1; i >= 0; i--) {
      const hr = heatRipples[i];
      hr.r += 1.5; hr.alpha -= 0.012;
      if (hr.alpha <= 0) { heatRipples.splice(i, 1); continue; }
      ictx.save();
      ictx.strokeStyle = `rgba(255,180,60,${hr.alpha})`;
      ictx.lineWidth = 1;
      ictx.beginPath();
      ictx.ellipse(hr.x, hr.y, hr.r, hr.r * 0.35, 0, 0, PI2);
      ictx.stroke(); ictx.restore();
    }

    // Sun reacts to cursor
    const rect = c.getBoundingClientRect();
    const normX = (mouseX - rect.left - c.width / 2) / c.width * 20;
    const sunOrb = $('sun-orb');
    if (sunOrb) sunOrb.style.transform = `translateX(calc(-50% + ${normX}px)) translateY(${window.scrollY * 0.08}px)`;

    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────
   RAIN ENGINE
   – Multi-layer rain, glass droplets,
     ripples, fog, lightning, cursor water
───────────────────────────────────── */
function initRainEngine() {
  const c   = $('rain-canvas');
  const ic  = $('rain-interact');
  const gc  = $('rain-glass');
  const ctx  = c.getContext('2d');
  const ictx = ic.getContext('2d');
  const gctx = gc.getContext('2d');

  const resize = () => {
    c.width = ic.width = gc.width = c.offsetWidth;
    c.height = ic.height = gc.height = c.offsetHeight;
  };
  window.addEventListener('resize', resize); resize();

  const DROPS = isMobile() ? 150 : 380;
  const drops = [], ripples = [], mouseRipples = [], glassDrops = [];

  class Drop {
    constructor() { this.reset(); }
    reset() {
      this.x     = rand(0, c.width);
      this.y     = rand(-c.height, 0);
      this.len   = rand(12, 32);
      this.speed = rand(9, 20);
      this.alpha = rand(0.15, 0.55);
      this.width = rand(0.3, 1.5);
      this.layer = Math.random(); // 0=back, 1=front
    }
    update() {
      this.x += 0.25 * this.speed * 0.15;
      this.y += this.speed * (0.5 + this.layer * 0.5);
      if (this.y > c.height + this.len) {
        if (Math.random() < 0.3) ripples.push(new Ripple(this.x, c.height - 4));
        this.reset(); this.y = rand(-100, 0);
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha * (0.4 + this.layer * 0.6);
      ctx.strokeStyle = `rgba(${150 + this.layer * 60},${200 + this.layer * 30},255,1)`;
      ctx.lineWidth   = this.width;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.len * 0.15, this.y + this.len);
      ctx.stroke(); ctx.restore();
    }
  }

  class Ripple {
    constructor(x, y) {
      this.x = x; this.y = y; this.r = 0;
      this.maxR  = rand(12, 28); this.alpha = 0.6;
      this.speed = rand(0.6, 1.8);
    }
    update() { this.r += this.speed; this.alpha -= 0.025; }
    draw() {
      ctx.save();
      ctx.strokeStyle = `rgba(140,200,255,${this.alpha})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r, this.r * 0.28, 0, 0, PI2);
      ctx.stroke(); ctx.restore();
    }
    dead() { return this.alpha <= 0 || this.r > this.maxR; }
  }

  class MouseRipple {
    constructor(x, y) {
      this.x = x; this.y = y; this.r = 0;
      this.alpha = 0.85; this.rings = 3;
    }
    update() { this.r += 2.2; this.alpha -= 0.016; }
    draw() {
      for (let i = 0; i < this.rings; i++) {
        const rr = this.r - i * 18;
        if (rr < 0) continue;
        ictx.save();
        ictx.strokeStyle = `rgba(80,160,255,${this.alpha - i * 0.25})`;
        ictx.lineWidth   = 1.5 - i * 0.35;
        ictx.beginPath();
        ictx.ellipse(this.x, this.y, rr, rr * 0.32, 0, 0, PI2);
        ictx.stroke(); ictx.restore();
      }
    }
    dead() { return this.alpha <= 0 || this.r > 100; }
  }

  // Glass droplets (slide down screen)
  class GlassDrop {
    constructor() { this.reset(); }
    reset() {
      this.x   = rand(0, gc.width);
      this.y   = rand(-30, gc.height * 0.3);
      this.r   = rand(3, 10);
      this.vy  = rand(0.4, 1.8);
      this.alpha = rand(0.15, 0.4);
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 20) this.trail.shift();
      this.x += Math.sin(this.y * 0.03) * 0.4;
      this.y += this.vy;
      if (this.y > gc.height + 20) this.reset();
    }
    draw() {
      // Trail
      if (this.trail.length > 1) {
        gctx.save();
        gctx.beginPath();
        gctx.moveTo(this.trail[0].x, this.trail[0].y);
        this.trail.forEach(p => gctx.lineTo(p.x, p.y));
        gctx.strokeStyle = `rgba(180,220,255,${this.alpha * 0.2})`;
        gctx.lineWidth = this.r * 0.5;
        gctx.lineCap = 'round';
        gctx.stroke(); gctx.restore();
      }
      // Drop body
      gctx.save();
      const g = gctx.createRadialGradient(this.x - this.r * 0.3, this.y - this.r * 0.3, 0, this.x, this.y, this.r);
      g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
      g.addColorStop(1, `rgba(140,200,255,${this.alpha * 0.4})`);
      gctx.beginPath(); gctx.arc(this.x, this.y, this.r, 0, PI2);
      gctx.fillStyle = g; gctx.fill(); gctx.restore();
    }
  }

  for (let i = 0; i < DROPS; i++) drops.push(new Drop());
  const glassCount = isMobile() ? 8 : 20;
  for (let i = 0; i < glassCount; i++) glassDrops.push(new GlassDrop());

  ic.addEventListener('mousemove', e => {
    if (Math.random() < 0.1) {
      const r = ic.getBoundingClientRect();
      mouseRipples.push(new MouseRipple(e.clientX - r.left, e.clientY - r.top));
    }
  });
  ic.addEventListener('click', e => {
    const r = ic.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      mouseRipples.push(new MouseRipple(
        e.clientX - r.left + rand(-15, 15),
        e.clientY - r.top + rand(-15, 15)
      ));
    }
  });

  // Lightning
  const lightning = $('lightning');
  let lightTimer = 0;
  function triggerLightning() {
    lightning.style.opacity = '1';
    setTimeout(() => { lightning.style.opacity = '0'; }, 55);
    setTimeout(() => { lightning.style.opacity = '0.7'; }, 110);
    setTimeout(() => { lightning.style.opacity = '0'; }, 175);
  }

  function animate() {
    if (currentSection !== 'rain') { requestAnimationFrame(animate); return; }
    ctx.clearRect(0, 0, c.width, c.height);
    ictx.clearRect(0, 0, ic.width, ic.height);
    gctx.clearRect(0, 0, gc.width, gc.height);

    // Fog
    const fogG = ctx.createLinearGradient(0, 0, 0, c.height);
    fogG.addColorStop(0,   'rgba(15,35,70,0)');
    fogG.addColorStop(0.6, 'rgba(15,35,70,0.06)');
    fogG.addColorStop(1,   'rgba(15,35,70,0.2)');
    ctx.fillStyle = fogG; ctx.fillRect(0, 0, c.width, c.height);

    drops.forEach(d => { d.update(); d.draw(); });
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update(); ripples[i].draw();
      if (ripples[i].dead()) ripples.splice(i, 1);
    }
    for (let i = mouseRipples.length - 1; i >= 0; i--) {
      mouseRipples[i].update(); mouseRipples[i].draw();
      if (mouseRipples[i].dead()) mouseRipples.splice(i, 1);
    }
    glassDrops.forEach(g => { g.update(); g.draw(); });

    lightTimer++;
    if (lightTimer > 180 + rand(0, 300)) {
      lightTimer = 0; triggerLightning();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────
   AUTUMN ENGINE
   – Dense layered leaves, wind lines,
     cursor vortex, golden haze
───────────────────────────────────── */
function initAutumnEngine() {
  const c   = $('autumn-canvas');
  const ic  = $('autumn-interact');
  const ctx = c.getContext('2d');

  const resize = () => { c.width = ic.width = c.offsetWidth; c.height = ic.height = c.offsetHeight; };
  window.addEventListener('resize', resize); resize();

  const LEAF_COUNT = isMobile() ? 80 : 220;
  const leafCols = ['#D2691E','#CD853F','#A0522D','#8B4513','#FF8C00','#FFB347','#FF6347','#DC143C','#B8860B','#DAA520','#C4741A','#E8963B','#FF4500'];
  const leaves = [];

  class Leaf {
    constructor(immediate) { this.reset(immediate); }
    reset(immediate) {
      this.x     = rand(-100, c.width + 100);
      this.y     = immediate ? rand(0, c.height) : rand(-50, -10);
      this.size  = rand(6, 18);
      this.vx    = rand(-1.2, 1.2);
      this.vy    = rand(0.6, 2.2);
      this.rot   = rand(0, PI2);
      this.rotV  = rand(-0.06, 0.06);
      this.color = randItem(leafCols);
      this.alpha = rand(0.45, 0.95);
      this.wobble = rand(0, PI2);
      this.wobbleSpeed = rand(0.02, 0.07);
      this.layer = Math.random();
      this.swirling = false;
      this.swirlAngle = 0;
      this.swirlR = 0;
    }
    update() {
      this.wobble += this.wobbleSpeed;
      // Cursor repel / swirl
      const rect = c.getBoundingClientRect();
      const cx  = mouseX - rect.left;
      const cy  = mouseY - rect.top;
      const dx  = this.x - cx, dy = this.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const f = (140 - dist) / 140;
        // Swirl effect
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        this.vx += Math.cos(angle) * f * 0.4 + dx * f * 0.06;
        this.vy += Math.sin(angle) * f * 0.4 + dy * f * 0.06;
        this.rotV += f * 0.04;
      }
      this.x  += this.vx + Math.sin(this.wobble) * 1.2;
      this.y  += this.vy;
      this.rot += this.rotV;
      this.rotV *= 0.98; // Dampen
      this.vx   *= 0.99;
      this.vy    = Math.max(this.vy, 0.4); // Min fall speed

      if (this.y > c.height + 40 || this.x < -140 || this.x > c.width + 140) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha * (0.45 + this.layer * 0.55);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.scale(1 + this.layer * 0.35, 1 + this.layer * 0.35);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.9, -this.size * 0.85, this.size * 0.95, 0.1, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.95, 0.1, -this.size * 0.9, -this.size * 0.85, 0, -this.size);
      ctx.fill();
      // Vein
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -this.size); ctx.lineTo(0, this.size);
      ctx.moveTo(0, 0); ctx.lineTo(this.size * 0.4, -this.size * 0.3);
      ctx.moveTo(0, 0); ctx.lineTo(-this.size * 0.4, -this.size * 0.3);
      ctx.stroke();
      ctx.restore();
    }
  }

  for (let i = 0; i < LEAF_COUNT; i++) leaves.push(new Leaf(true));

  // Wind streaks
  const windLines = Array.from({ length: isMobile() ? 12 : 30 }, () => ({
    x: rand(0, c.width), y: rand(0, c.height),
    len: rand(50, 120), speed: rand(2, 5), alpha: rand(0.04, 0.14)
  }));

  // Golden ambient haze
  function drawHaze() {
    const g = ctx.createRadialGradient(c.width * 0.5, c.height * 0.35, 0, c.width * 0.5, c.height * 0.35, c.width * 0.7);
    g.addColorStop(0, 'rgba(200,100,0,0.04)');
    g.addColorStop(1, 'rgba(200,80,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
  }

  function animate() {
    if (currentSection !== 'autumn') { requestAnimationFrame(animate); return; }
    ctx.clearRect(0, 0, c.width, c.height);
    drawHaze();

    windLines.forEach(w => {
      ctx.save();
      ctx.globalAlpha = w.alpha;
      const g = ctx.createLinearGradient(w.x, w.y, w.x + w.len, w.y);
      g.addColorStop(0, 'rgba(200,130,50,0)');
      g.addColorStop(0.5, 'rgba(200,130,50,0.5)');
      g.addColorStop(1, 'rgba(200,130,50,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x + w.len, w.y);
      ctx.stroke(); ctx.restore();
      w.x += w.speed * 2.5;
      if (w.x > c.width + 130) { w.x = -130; w.y = rand(0, c.height); }
    });

    leaves.sort((a, b) => a.layer - b.layer);
    leaves.forEach(l => { l.update(); l.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────
   WINTER ENGINE
   – Multi-type snowflakes, frost edges,
     breath mist, cursor melt effect
───────────────────────────────────── */
function initWinterEngine() {
  const c   = $('winter-canvas');
  const ic  = $('winter-interact');
  const ctx = c.getContext('2d');
  const ictx = ic.getContext('2d');

  const resize = () => { c.width = ic.width = c.offsetWidth; c.height = ic.height = c.offsetHeight; };
  window.addEventListener('resize', resize); resize();

  const FLAKE_COUNT = isMobile() ? 120 : 300;
  const flakes = [], meltPoints = [];

  class Snowflake {
    constructor(immediate) { this.reset(immediate); }
    reset(immediate) {
      this.x     = rand(0, c.width);
      this.y     = immediate ? rand(-30, c.height) : rand(-30, -5);
      this.size  = rand(1, 5);
      this.vx    = rand(-0.6, 0.6);
      this.vy    = rand(0.3, 1.4);
      this.alpha = rand(0.3, 0.9);
      this.wobble = rand(0, PI2);
      this.wobbleSpeed = rand(0.01, 0.04);
      this.type  = Math.random() < 0.25 ? 'crystal' : Math.random() < 0.5 ? 'star' : 'dot';
      this.rot   = rand(0, PI2);
      this.rotV  = rand(-0.01, 0.01);
    }
    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble) * 0.5;
      this.y += this.vy;
      this.rot += this.rotV;
      if (this.y > c.height + 12) this.reset(false);
      if (this.x < -10) this.x = c.width + 10;
      if (this.x > c.width + 10) this.x = -10;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      if (this.type === 'dot') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, PI2);
        ctx.fillStyle = `rgba(220,235,255,${this.alpha})`;
        ctx.fill();
      } else if (this.type === 'star') {
        ctx.strokeStyle = `rgba(200,225,255,${this.alpha * 0.9})`;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(-this.size, 0); ctx.lineTo(this.size, 0);
          ctx.stroke(); ctx.rotate(Math.PI / 4);
        }
      } else {
        // Crystal snowflake
        ctx.strokeStyle = `rgba(190,220,255,${this.alpha})`;
        ctx.lineWidth = 0.7;
        for (let i = 0; i < 6; i++) {
          ctx.save(); ctx.rotate(i / 6 * PI2);
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(0, -this.size * 2.2);
          ctx.moveTo(0, -this.size * 0.9); ctx.lineTo(-this.size * 0.5, -this.size * 1.5);
          ctx.moveTo(0, -this.size * 0.9); ctx.lineTo(this.size * 0.5,  -this.size * 1.5);
          ctx.moveTo(0, -this.size * 1.6); ctx.lineTo(-this.size * 0.3, -this.size * 1.9);
          ctx.moveTo(0, -this.size * 1.6); ctx.lineTo(this.size * 0.3,  -this.size * 1.9);
          ctx.stroke(); ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < FLAKE_COUNT; i++) flakes.push(new Snowflake(true));

  ic.addEventListener('mousemove', e => {
    const r = ic.getBoundingClientRect();
    meltPoints.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, alpha: 0.45 });
    if (meltPoints.length > 50) meltPoints.shift();
  });

  function drawBreathMist() {
    const bx = c.width * 0.5, by = c.height * 0.72;
    const t  = Date.now() * 0.001;
    ctx.save();
    ctx.globalAlpha = 0.04 + Math.sin(t * 0.7) * 0.015;
    const g = ctx.createEllipse
      ? null
      : (() => {
          const g2 = ctx.createRadialGradient(bx, by, 0, bx, by - 15, 60);
          g2.addColorStop(0, 'rgba(200,225,255,1)');
          g2.addColorStop(1, 'rgba(180,210,255,0)');
          return g2;
        })();
    if (g) {
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(bx, by - 15, 60, 35, 0, 0, PI2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFrostEdges() {
    // Corner frost crystals
    const corners = [[0,0],[c.width,0],[0,c.height],[c.width,c.height]];
    corners.forEach(([cx2, cy2]) => {
      const g = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 180);
      g.addColorStop(0, 'rgba(180,215,255,0.12)');
      g.addColorStop(1, 'rgba(160,200,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx2 - 180, cy2 - 180, 360, 360);
    });
  }

  function animate() {
    if (currentSection !== 'winter') {
      $('frost-overlay').style.opacity = '0';
      requestAnimationFrame(animate); return;
    }
    $('frost-overlay').style.opacity = '1';
    ctx.clearRect(0, 0, c.width, c.height);
    ictx.clearRect(0, 0, ic.width, ic.height);

    drawFrostEdges();
    flakes.forEach(f => { f.update(); f.draw(); });
    drawBreathMist();

    // Melt reveal (warm glow where cursor passes)
    for (let i = meltPoints.length - 1; i >= 0; i--) {
      const mp = meltPoints[i];
      mp.r += 1.2; mp.alpha -= 0.008;
      if (mp.alpha <= 0) { meltPoints.splice(i, 1); continue; }
      const g = ictx.createRadialGradient(mp.x, mp.y, 0, mp.x, mp.y, mp.r + 40);
      g.addColorStop(0, `rgba(255,130,60,${mp.alpha})`);
      g.addColorStop(0.5, `rgba(255,80,30,${mp.alpha * 0.3})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ictx.beginPath(); ictx.fillStyle = g;
      ictx.arc(mp.x, mp.y, mp.r + 40, 0, PI2); ictx.fill();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────
   SPRING ENGINE
   – Petals, pollen, butterflies,
     blooming flowers near cursor
───────────────────────────────────── */
function initSpringEngine() {
  const c   = $('spring-canvas');
  const ic  = $('spring-interact');
  const ctx = c.getContext('2d');
  const ictx = ic.getContext('2d');

  const resize = () => { c.width = ic.width = c.offsetWidth; c.height = ic.height = c.offsetHeight; };
  window.addEventListener('resize', resize); resize();

  const PETAL_COUNT  = isMobile() ? 60 : 160;
  const POLLEN_COUNT = isMobile() ? 80 : 200;
  const petalCols = ['#FFB7D5','#FFD1DC','#FF99BB','#FFC0CB','#FFAACC','#F4A7B9','#E8A0BF','#FADADD'];
  const springGreen = ['#90EE90','#98FB98','#7BC67E','#B8F0B8','#ADDFAD'];
  const petals = [], pollen = [], butterflies = [], cursorFlowers = [];

  class Petal {
    constructor(immediate) { this.reset(immediate); }
    reset(immediate) {
      this.x     = rand(-60, c.width + 60);
      this.y     = immediate ? rand(0, c.height) : rand(-40, -5);
      this.size  = rand(5, 14);
      this.vx    = rand(-0.8, 1.2);
      this.vy    = rand(0.5, 1.8);
      this.rot   = rand(0, PI2); this.rotV = rand(-0.05, 0.05);
      this.color = randItem(petalCols);
      this.alpha = rand(0.45, 0.9);
      this.wobble = rand(0, PI2); this.wobbleSpeed = rand(0.02, 0.06);
    }
    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble) * 1.4;
      this.y += this.vy; this.rot += this.rotV;
      if (this.y > c.height + 30 || this.x < -80 || this.x > c.width + 80) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y); ctx.rotate(this.rot);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.8, this.size * 0.8, this.size * 0.3, 0, this.size * 0.6);
      ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.3, -this.size * 0.8, -this.size * 0.8, 0, -this.size);
      ctx.fill(); ctx.restore();
    }
  }

  class Pollen {
    constructor() { this.reset(); }
    reset() {
      this.x     = rand(0, c.width);
      this.y     = rand(0, c.height);
      this.size  = rand(0.5, 2.5);
      this.vx    = rand(-0.5, 0.5); this.vy = rand(-0.3, 0.3);
      this.alpha = rand(0.1, 0.5);
      this.wobble = rand(0, PI2); this.wobbleSpeed = rand(0.01, 0.05);
    }
    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble + Date.now() * 0.001) * 0.3;
      this.y += this.vy + Math.cos(this.wobble) * 0.2;
      if (this.x < -5) this.x = c.width + 5;
      if (this.x > c.width + 5) this.x = -5;
      if (this.y < -5) this.y = c.height + 5;
      if (this.y > c.height + 5) this.y = -5;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, PI2);
      ctx.fillStyle = `rgba(255,240,120,${this.alpha})`;
      ctx.fill();
    }
  }

  class Butterfly {
    constructor() {
      this.x = rand(0, c.width); this.y = rand(50, c.height * 0.7);
      this.vx = rand(-1.2, 1.2); this.vy = rand(-0.5, 0.5);
      this.wingAngle = rand(0, PI2); this.wingSpeed = rand(0.08, 0.18);
      this.size = rand(10, 20);
      this.col1 = randItem(['#FF99BB','#FFB347','#7BC67E','#87CEEB','#FFD700','#DDA0DD']);
      this.col2 = randItem(['#FFD1DC','#FFE066','#98FB98','#B0E0E6','#FFF0A0','#EE82EE']);
      this.targetX = rand(0, c.width); this.targetY = rand(50, c.height * 0.6);
      this.timer = 0; this.alpha = rand(0.5, 0.9);
      this.following = false;
    }
    update() {
      this.wingAngle += this.wingSpeed;
      // Optionally follow cursor briefly
      const rect = c.getBoundingClientRect();
      const mx = mouseX - rect.left, my = mouseY - rect.top;
      const dist = Math.hypot(this.x - mx, this.y - my);
      if (dist < 120) { this.targetX = mx + rand(-40, 40); this.targetY = my + rand(-40, 40); }
      else {
        this.timer++;
        if (this.timer > 180) { this.targetX = rand(50, c.width - 50); this.targetY = rand(50, c.height * 0.65); this.timer = 0; }
      }
      this.x = lerp(this.x, this.targetX, 0.012);
      this.y = lerp(this.y, this.targetY, 0.012);
      this.y += Math.sin(this.wingAngle * 0.4) * 0.8;
    }
    draw() {
      ctx.save(); ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      const w = Math.abs(Math.sin(this.wingAngle));
      // Upper wings
      ctx.fillStyle = this.col1;
      ctx.beginPath();
      ctx.ellipse(-this.size * 0.6 * w, -this.size * 0.3, this.size * w, this.size * 0.8, -0.4, 0, PI2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(this.size * 0.6 * w, -this.size * 0.3, this.size * w, this.size * 0.8, 0.4, 0, PI2);
      ctx.fill();
      // Lower wings
      ctx.fillStyle = this.col2;
      ctx.globalAlpha = this.alpha * 0.7;
      ctx.beginPath();
      ctx.ellipse(-this.size * 0.4 * w, this.size * 0.3, this.size * 0.7 * w, this.size * 0.5, -0.5, 0, PI2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(this.size * 0.4 * w, this.size * 0.3, this.size * 0.7 * w, this.size * 0.5, 0.5, 0, PI2);
      ctx.fill();
      // Body
      ctx.fillStyle = '#2a1a0a';
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.ellipse(0, 0, 2, this.size * 0.7, 0, 0, PI2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PETAL_COUNT;  i++) petals.push(new Petal(true));
  for (let i = 0; i < POLLEN_COUNT; i++) pollen.push(new Pollen());
  const butterflyCount = isMobile() ? 2 : 5;
  for (let i = 0; i < butterflyCount; i++) butterflies.push(new Butterfly());

  // Bloom flowers near cursor
  ic.addEventListener('mousemove', e => {
    if (Math.random() < 0.04) {
      const r = ic.getBoundingClientRect();
      cursorFlowers.push({
        x: e.clientX - r.left + rand(-20, 20),
        y: e.clientY - r.top + rand(-20, 20),
        phase: 0, size: 0, maxSize: rand(8, 18),
        color: randItem(petalCols), alpha: 1
      });
    }
  });

  function drawCursorFlower(f) {
    if (f.alpha <= 0) return;
    ictx.save();
    ictx.globalAlpha = f.alpha;
    ictx.translate(f.x, f.y);
    const petN = 5;
    for (let i = 0; i < petN; i++) {
      ictx.save();
      ictx.rotate(i / petN * PI2);
      ictx.fillStyle = f.color;
      ictx.beginPath();
      ictx.ellipse(0, -f.size, f.size * 0.5, f.size * 0.9, 0, 0, PI2);
      ictx.fill(); ictx.restore();
    }
    ictx.fillStyle = '#FFD700';
    ictx.beginPath(); ictx.arc(0, 0, f.size * 0.3, 0, PI2); ictx.fill();
    ictx.restore();
  }

  // Soft green ambient glow
  function drawSpringGlow() {
    const g = ctx.createRadialGradient(c.width * 0.5, c.height * 0.4, 0, c.width * 0.5, c.height * 0.4, c.width * 0.6);
    g.addColorStop(0, 'rgba(80,180,80,0.04)');
    g.addColorStop(1, 'rgba(60,160,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
  }

  function animate() {
    if (currentSection !== 'spring') { requestAnimationFrame(animate); return; }
    ctx.clearRect(0, 0, c.width, c.height);
    ictx.clearRect(0, 0, ic.width, ic.height);
    drawSpringGlow();
    pollen.forEach(p => { p.update(); p.draw(); });
    petals.forEach(p => { p.update(); p.draw(); });
    butterflies.forEach(b => { b.update(); b.draw(); });
    for (let i = cursorFlowers.length - 1; i >= 0; i--) {
      const f = cursorFlowers[i];
      f.phase += 0.06;
      f.size = Math.min(f.size + 0.5, f.maxSize);
      f.alpha -= 0.012;
      drawCursorFlower(f);
      if (f.alpha <= 0) cursorFlowers.splice(i, 1);
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────
   FINALE ENGINE
   – Star field + all-season merge spiral
───────────────────────────────────── */
function initFinaleEngine() {
  const c   = $('finale-canvas');
  const mc  = $('merge-canvas');
  const ctx = c.getContext('2d');
  const mctx = mc.getContext('2d');

  const resize = () => {
    c.width  = mc.width  = c.offsetWidth  || window.innerWidth;
    c.height = mc.height = c.offsetHeight || window.innerHeight;
  };
  window.addEventListener('resize', resize); resize();

  // Stars
  const starCount = isMobile() ? 120 : 300;
  const stars = Array.from({ length: starCount }, () => ({
    x: rand(0, 1000), y: rand(0, 1000),
    size: rand(0.4, 2.5), alpha: rand(0.2, 0.9),
    twinkle: rand(0, PI2), twinkleSpeed: rand(0.01, 0.05)
  }));

  // Season-colored orbs
  const orbData = [
    { col: '255,180,80', x: rand(100,900), y: rand(100,900), vx: rand(-0.2,0.2), vy: rand(-0.2,0.2), r: rand(60,120), alpha: 0.06 },
    { col: '80,130,220', x: rand(100,900), y: rand(100,900), vx: rand(-0.2,0.2), vy: rand(-0.2,0.2), r: rand(60,120), alpha: 0.06 },
    { col: '200,90,30',  x: rand(100,900), y: rand(100,900), vx: rand(-0.2,0.2), vy: rand(-0.2,0.2), r: rand(60,120), alpha: 0.06 },
    { col: '180,210,255',x: rand(100,900), y: rand(100,900), vx: rand(-0.2,0.2), vy: rand(-0.2,0.2), r: rand(60,120), alpha: 0.06 },
    { col: '100,200,100',x: rand(100,900), y: rand(100,900), vx: rand(-0.2,0.2), vy: rand(-0.2,0.2), r: rand(60,120), alpha: 0.06 }
  ];

  function animate() {
    if (currentSection !== 'finale') { requestAnimationFrame(animate); return; }
    c.width  = c.offsetWidth  || window.innerWidth;
    c.height = c.offsetHeight || window.innerHeight;
    ctx.clearRect(0, 0, c.width, c.height);

    stars.forEach(s => {
      s.twinkle += s.twinkleSpeed;
      const a = (Math.sin(s.twinkle) * 0.4 + 0.6) * s.alpha;
      ctx.beginPath();
      ctx.arc(s.x / 1000 * c.width, s.y / 1000 * c.height, s.size, 0, PI2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });

    orbData.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      if (o.x < 0 || o.x > 1000) o.vx *= -1;
      if (o.y < 0 || o.y > 1000) o.vy *= -1;
      const px = o.x / 1000 * c.width, py = o.y / 1000 * c.height;
      const g  = ctx.createRadialGradient(px, py, 0, px, py, o.r);
      g.addColorStop(0, `rgba(${o.col},${o.alpha})`);
      g.addColorStop(1, `rgba(${o.col},0)`);
      ctx.beginPath(); ctx.fillStyle = g;
      ctx.arc(px, py, o.r, 0, PI2); ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────
   FINALE SEQUENCE — All particles merge
───────────────────────────────────── */
function triggerFinaleSequence() {
  const mc   = $('merge-canvas');
  const mctx = mc.getContext('2d');
  mc.width   = mc.offsetWidth  || window.innerWidth;
  mc.height  = mc.offsetHeight || window.innerHeight;

  const cx = mc.width / 2, cy = mc.height / 2;

  // Spawn one particle from each season
  const spawnCols = [
    { r:255, g:200, b:80  }, // summer
    { r:80,  g:140, b:255 }, // rain
    { r:210, g:100, b:30  }, // autumn
    { r:200, g:225, b:255 }, // winter
    { r:100, g:210, b:120 }  // spring
  ];

  const mergeParticles = [];
  for (let season = 0; season < 5; season++) {
    const col = spawnCols[season];
    const count = isMobile() ? 30 : 80;
    for (let i = 0; i < count; i++) {
      const angle = rand(0, PI2);
      const dist  = rand(mc.width * 0.35, mc.width * 0.55);
      mergeParticles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        angle, dist,
        r: col.r, g: col.g, b: col.b,
        size: rand(2, 6), alpha: rand(0.4, 0.9),
        speed: rand(0.008, 0.022),
        spiralAngle: angle,
        phase: 'inward'
      });
    }
  }

  let spiralTime = 0;
  let spiralDone = false;

  (function mergeLoop() {
    if (currentSection !== 'finale') {
      mctx.clearRect(0, 0, mc.width, mc.height);
      requestAnimationFrame(mergeLoop); return;
    }
    mc.width  = mc.offsetWidth  || window.innerWidth;
    mc.height = mc.offsetHeight || window.innerHeight;
    mctx.clearRect(0, 0, mc.width, mc.height);
    spiralTime += 0.012;

    if (!spiralDone) {
      let allDone = true;
      mergeParticles.forEach(p => {
        if (p.phase === 'inward') {
          p.dist    = lerp(p.dist, 0, p.speed);
          p.spiralAngle += 0.04;
          p.x = cx + Math.cos(p.spiralAngle) * p.dist;
          p.y = cy + Math.sin(p.spiralAngle) * p.dist;
          if (p.dist < 10) { p.phase = 'burst'; p.vx = rand(-4,4); p.vy = rand(-4,4); }
          else allDone = false;
        } else {
          p.x += p.vx; p.y += p.vy;
          p.alpha -= 0.015; p.vy += 0.05;
        }
        if (p.alpha > 0) {
          mctx.beginPath();
          mctx.arc(p.x, p.y, p.size, 0, PI2);
          mctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
          mctx.fill();
        }
      });
      if (allDone) spiralDone = true;
    } else {
      // Central burst glow
      const glow = mctx.createRadialGradient(cx, cy, 0, cx, cy, 150 + Math.sin(spiralTime) * 30);
      glow.addColorStop(0, `rgba(255,240,200,${0.3 + Math.sin(spiralTime) * 0.1})`);
      glow.addColorStop(0.4, `rgba(200,160,255,0.08)`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      mctx.beginPath(); mctx.fillStyle = glow;
      mctx.arc(cx, cy, 180, 0, PI2); mctx.fill();
    }
    requestAnimationFrame(mergeLoop);
  })();
}

/* ─────────────────────────────────────
   COSMOS ENGINE
   – Stars, nebula, constellations,
     interactive universe particles
───────────────────────────────────── */
function initCosmosEngine() {
  const c   = $('cosmos-canvas');
  const ic  = $('cosmos-interact');
  const ctx = c.getContext('2d');
  const ictx = ic.getContext('2d');

  const resize = () => { c.width = ic.width = c.offsetWidth; c.height = ic.height = c.offsetHeight; };
  window.addEventListener('resize', resize); resize();

  const STAR_COUNT = isMobile() ? 200 : 500;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: rand(0, c.width), y: rand(0, c.height),
    size: rand(0.3, 3.5), alpha: rand(0.2, 1),
    twinkle: rand(0, PI2), twinkleSpeed: rand(0.005, 0.04),
    hue: randInt(200, 280), saturation: randInt(20, 80)
  }));

  // Nebula clouds
  const nebulae = Array.from({ length: isMobile() ? 4 : 8 }, () => ({
    x: rand(0.1, 0.9), y: rand(0.1, 0.9),
    rx: rand(0.12, 0.35), ry: rand(0.08, 0.22),
    hue: randInt(220, 340), alpha: rand(0.03, 0.08),
    phase: rand(0, PI2), speed: rand(0.003, 0.008)
  }));

  // Shooting stars
  const shootingStars = [];
  let shootTimer = 0;

  // Constellation lines (simple connect-the-dots)
  const constellationPoints = Array.from({ length: 12 }, () => ({
    x: rand(100, c.width - 100), y: rand(80, c.height - 80),
    vx: rand(-0.15, 0.15), vy: rand(-0.1, 0.1),
    size: rand(2, 4), alpha: rand(0.5, 0.9), hue: randInt(200, 260)
  }));
  const constellationEdges = [];
  for (let i = 0; i < constellationPoints.length; i++) {
    for (let j = i + 1; j < constellationPoints.length; j++) {
      if (Math.random() < 0.2) constellationEdges.push([i, j]);
    }
  }

  // Interactive universe — cursor creates galaxy
  const cosmoParticles = [];
  ic.addEventListener('mousemove', e => {
    if (Math.random() < 0.15) {
      const r = ic.getBoundingClientRect();
      const angle = rand(0, PI2);
      cosmoParticles.push({
        x: e.clientX - r.left, y: e.clientY - r.top,
        vx: Math.cos(angle) * rand(0.5, 2),
        vy: Math.sin(angle) * rand(0.5, 2),
        size: rand(1, 4), alpha: rand(0.6, 1),
        hue: randInt(200, 340), decay: rand(0.01, 0.025)
      });
    }
  });
  ic.addEventListener('click', e => {
    const r = ic.getBoundingClientRect();
    for (let i = 0; i < 30; i++) {
      const angle = rand(0, PI2), speed = rand(1, 5);
      cosmoParticles.push({
        x: e.clientX - r.left, y: e.clientY - r.top,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: rand(1, 5), alpha: rand(0.7, 1),
        hue: randInt(200, 340), decay: rand(0.01, 0.02)
      });
    }
  });

  function drawNebulae() {
    nebulae.forEach(n => {
      n.phase += n.speed;
      const px = n.x * c.width, py = n.y * c.height;
      const rx = n.rx * c.width, ry = n.ry * c.height;
      ctx.save();
      const g = ctx.createRadialGradient(px, py, 0, px, py, Math.max(rx, ry));
      g.addColorStop(0, `hsla(${n.hue},80%,60%,${n.alpha + Math.sin(n.phase) * 0.02})`);
      g.addColorStop(0.5, `hsla(${n.hue + 30},70%,50%,${n.alpha * 0.5})`);
      g.addColorStop(1, `hsla(${n.hue},60%,40%,0)`);
      ctx.scale(1, ry / rx);
      ctx.beginPath(); ctx.arc(px, py * (rx / ry), rx, 0, PI2);
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    });
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: rand(0, c.width * 0.6), y: rand(0, c.height * 0.3),
      len: rand(60, 180), angle: rand(0.4, 0.9),
      speed: rand(6, 14), alpha: 1, width: rand(1, 2.5),
      hue: randInt(180, 280)
    });
  }

  function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= 0.025;
      if (s.alpha <= 0 || s.x > c.width || s.y > c.height) { shootingStars.splice(i, 1); continue; }
      const x2 = s.x - Math.cos(s.angle) * s.len;
      const y2 = s.y - Math.sin(s.angle) * s.len;
      const g  = ctx.createLinearGradient(s.x, s.y, x2, y2);
      g.addColorStop(0, `hsla(${s.hue},80%,90%,${s.alpha})`);
      g.addColorStop(1, `hsla(${s.hue},80%,70%,0)`);
      ctx.save(); ctx.lineWidth = s.width; ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x2, y2);
      ctx.stroke(); ctx.restore();
    }
  }

  function drawConstellations() {
    constellationPoints.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 50)            p.vx =  Math.abs(p.vx);
      if (p.x > c.width - 50)  p.vx = -Math.abs(p.vx);
      if (p.y < 50)            p.vy =  Math.abs(p.vy);
      if (p.y > c.height - 50) p.vy = -Math.abs(p.vy);
    });
    constellationEdges.forEach(([i, j]) => {
      const a = constellationPoints[i], b = constellationPoints[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > 250) return;
      ctx.save();
      ctx.globalAlpha = (1 - dist / 250) * 0.18;
      ctx.strokeStyle = `hsl(220,70%,80%)`;
      ctx.lineWidth   = 0.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.stroke(); ctx.restore();
    });
    constellationPoints.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      g.addColorStop(0, `hsla(${p.hue},80%,90%,1)`);
      g.addColorStop(1, `hsla(${p.hue},60%,70%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, PI2); ctx.fill();
      ctx.restore();
    });
  }

  function animate() {
    if (currentSection !== 'cosmos') { requestAnimationFrame(animate); return; }
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    ctx.clearRect(0, 0, c.width, c.height);
    ictx.clearRect(0, 0, ic.width, ic.height);

    drawNebulae();

    // Stars
    stars.forEach(s => {
      s.twinkle += s.twinkleSpeed;
      const a = (Math.sin(s.twinkle) * 0.4 + 0.6) * s.alpha;
      ctx.save();
      ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
      g.addColorStop(0, `hsl(${s.hue},${s.saturation}%,95%)`);
      g.addColorStop(1, `hsl(${s.hue},${s.saturation}%,70%,0)`);
      ctx.fillStyle = `hsl(${s.hue},${s.saturation}%,90%)`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, PI2); ctx.fill();
      ctx.restore();
    });

    drawConstellations();
    drawShootingStars();

    shootTimer++;
    if (shootTimer > 120 + randInt(0, 200)) { shootTimer = 0; spawnShootingStar(); }

    // Interactive cosmos particles
    for (let i = cosmoParticles.length - 1; i >= 0; i--) {
      const p = cosmoParticles[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.97; p.vy *= 0.97;
      p.alpha -= p.decay;
      if (p.alpha <= 0) { cosmoParticles.splice(i, 1); continue; }
      ictx.save();
      ictx.globalAlpha = p.alpha;
      const g = ictx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      g.addColorStop(0, `hsla(${p.hue},80%,80%,1)`);
      g.addColorStop(1, `hsla(${p.hue},60%,60%,0)`);
      ictx.fillStyle = g;
      ictx.beginPath(); ictx.arc(p.x, p.y, p.size * 2, 0, PI2); ictx.fill();
      ictx.restore();
    }

    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────
   COSMOS UNLOCK
───────────────────────────────────── */
$('cosmos-unlock').addEventListener('click', () => {
  cosmosUnlocked = true;
  const cosmosSection = $('cosmos');
  cosmosSection.classList.remove('hidden');
  cosmosSection.style.display = '';

  // Show cosmos compass dot
  const cosmosDot = document.querySelector('.cosmos-dot');
  if (cosmosDot) cosmosDot.classList.remove('hidden');

  // Scroll to cosmos
  setTimeout(() => {
    cosmosSection.scrollIntoView({ behavior: 'smooth' });
  }, 300);
});

$('begin-again').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => activateSection('summer'), 700);
});

/* ─────────────────────────────────────
   EASTER EGGS
───────────────────────────────────── */
function initEasterEggs() {
  const overlay  = $('easter-egg-overlay');
  const quoteEl  = $('ee-quote-text');
  const closeBtn = $('ee-close');

  const hiddenQuotes = [
    '"Every ending is secretly a beginning in disguise."',
    '"Between seasons lives the most honest version of you."',
    '"The universe didn\'t pause when your season changed. Neither should you."',
    '"You don\'t have to be permanent to be powerful."',
    '"Even silence has something to say if you listen long enough."',
    '"You found this. That means you\'re the kind of person who looks carefully."'
  ];

  function showEasterEgg(quote) {
    quoteEl.textContent = quote;
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }
  function hideEasterEgg() {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 800);
  }

  closeBtn.addEventListener('click', hideEasterEgg);

  // EGG 1: Click sun orb 5 times
  let sunClicks = 0;
  const sunOrb = $('sun-orb');
  if (sunOrb) {
    sunOrb.style.pointerEvents = 'auto';
    sunOrb.style.cursor = 'pointer';
    sunOrb.addEventListener('click', () => {
      sunClicks++;
      sunOrb.style.transform = (sunOrb.style.transform || '') + ' scale(1.15)';
      setTimeout(() => sunOrb.style.transform = sunOrb.style.transform.replace(' scale(1.15)', ''), 300);
      if (sunClicks >= 5) {
        sunClicks = 0;
        showEasterEgg(hiddenQuotes[0]);
      }
    });
  }

  // EGG 2: Hover over season title for 3 seconds on winter
  let winterHoverTimer = null;
  const winterTitle = document.querySelector('#winter .season-title');
  if (winterTitle) {
    winterTitle.style.cursor = 'default';
    winterTitle.addEventListener('mouseenter', () => {
      winterHoverTimer = setTimeout(() => showEasterEgg(hiddenQuotes[1]), 3000);
    });
    winterTitle.addEventListener('mouseleave', () => clearTimeout(winterHoverTimer));
  }

  // EGG 3: Konami-style — click season tags in order: Summer, Rain, Autumn, Winter, Spring
  let tagSequence = [];
  const tagTarget = ['Success', 'Failure', 'Change', 'Patience', 'Hope'];
  $$('.meaning-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      tagSequence.push(tag.textContent.trim());
      if (tagSequence.length > 5) tagSequence.shift();
      if (JSON.stringify(tagSequence) === JSON.stringify(tagTarget)) {
        tagSequence = [];
        showEasterEgg(hiddenQuotes[2]);
      }
    });
  });

  // EGG 4: Triple-click quote line
  let quoteLineClicks = 0, quoteLineTimer = null;
  $$('.quote-line').forEach(ql => {
    ql.style.cursor = 'pointer';
    ql.addEventListener('click', () => {
      quoteLineClicks++;
      clearTimeout(quoteLineTimer);
      quoteLineTimer = setTimeout(() => quoteLineClicks = 0, 800);
      if (quoteLineClicks >= 3) {
        quoteLineClicks = 0;
        showEasterEgg(randItem(hiddenQuotes.slice(3)));
      }
    });
  });

  // EGG 5: Idle on cosmos for 20 seconds
  let cosmosIdleTimer = null;
  const cosmosObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        cosmosIdleTimer = setTimeout(() => showEasterEgg(hiddenQuotes[5]), 20000);
      } else {
        clearTimeout(cosmosIdleTimer);
      }
    });
  }, { threshold: 0.5 });
  const cosmosEl = $('cosmos');
  if (cosmosEl) cosmosObs.observe(cosmosEl);
}

/* ─────────────────────────────────────
   SOUND INTEGRATION on section change
   (call playSeasonAmbience whenever
   activateSection is called)
───────────────────────────────────── */
// Monkey-patch activateSection to also switch audio
const _baseActivate = activateSection;
window._activateSection = function(id) {
  _baseActivate(id);
  if (soundEnabled) playSeasonAmbience(id);
};

// Patch IntersectionObserver calls to go through _activateSection
// (We've already built it inline above; the sound switch fires via
//  the observer calling activateSection directly, which already
//  checks soundEnabled internally via the local reference.)

/* ─────────────────────────────────────
   PARALLAX SCROLL
───────────────────────────────────── */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  // Parallax section backgrounds
  $$('.section-bg').forEach(bg => {
    bg.style.transform = `translateY(${y * 0.04}px)`;
  });
}, { passive: true });

/* ─────────────────────────────────────
   RESIZE HANDLER
───────────────────────────────────── */
window.addEventListener('resize', () => {
  $$('canvas').forEach(cv => {
    if (cv.parentElement && cv.id !== 'cursor-fx-canvas') {
      cv.width  = cv.parentElement.offsetWidth  || window.innerWidth;
      cv.height = cv.parentElement.offsetHeight || window.innerHeight;
    }
  });
  const fxc = $('cursor-fx-canvas');
  if (fxc) { fxc.width = window.innerWidth; fxc.height = window.innerHeight; }
});

/* ─────────────────────────────────────
   GLOBAL MOUSE TRACK
───────────────────────────────────── */
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, { passive: true });
