/* =========================================================
   Sanflix — site behaviour (no libraries)
   1. Language switch (English / हिंदी), remembered per visitor
   2. Mobile menu
   3. Home hero: product scenes (colour, ingredients, tilt, bubbles)
   4. "Wipe clean" panel
   5. Reveal-on-scroll
   6. Enquiry form (Formspree)
   7. Sanflix Assistant (simple keyword chatbot)
   ========================================================= */

const WHATSAPP = '918168800195';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lang = () => (document.documentElement.dataset.lang === 'hi' ? 'hi' : 'en');

/* ---------- 1. Language ---------- */
function setLang(next) {
  const html = document.documentElement;
  html.dataset.lang = next;
  html.lang = next === 'hi' ? 'hi' : 'en';
  try { localStorage.setItem('sanflix-lang', next); } catch (e) { /* private mode: fine */ }
  document.querySelectorAll('.lang-toggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === next)));
  // Attributes that can't hold two spans (placeholders, aria-labels)
  document.querySelectorAll('[data-hi-placeholder]').forEach(el => {
    if (!el.dataset.enPlaceholder) el.dataset.enPlaceholder = el.placeholder;
    el.placeholder = next === 'hi' ? el.dataset.hiPlaceholder : el.dataset.enPlaceholder;
  });
  document.dispatchEvent(new CustomEvent('langchange'));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-toggle button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang(lang());

  initMenu();
  initHero();
  initWipe();
  initReveal();
  initForm();
  initChat();
});

/* ---------- 2. Mobile menu ---------- */
function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ---------- 3. Home hero: product scenes ----------
   Each product is a "scene": background colour, headline, floating
   ingredients and bottle. Scenes rotate on their own; the thumbnails
   switch them. The bottle and ingredients tilt with the mouse (or the
   phone's tilt), and soap bubbles drift up and pop when touched. */

// Small drawings of each product's ingredients (100 x 100 SVG)
const ING = {
  lemonSlice: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f2c500"/><circle cx="50" cy="50" r="41" fill="#fff7c2"/><g fill="#ffdf3d" stroke="#fff7c2" stroke-width="3">' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path transform="rotate(${a} 50 50)" d="M50 50 L50 13 A37 37 0 0 1 76.2 23.8 Z"/>`).join('') + '</g><circle cx="50" cy="50" r="4" fill="#fff7c2"/></svg>',
  lemon: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="52" rx="42" ry="32" fill="#f5cf0c"/><ellipse cx="50" cy="52" rx="42" ry="32" fill="none" stroke="#dcb300" stroke-width="2"/><path d="M8 52 q-6 0 -6 -4 M92 52 q6 0 6 -4" stroke="#dcb300" stroke-width="5" stroke-linecap="round"/><ellipse cx="36" cy="40" rx="14" ry="6" fill="#fff3a1" opacity=".8"/></svg>',
  leaf: '<svg viewBox="0 0 100 100"><path d="M8 70 C 22 18, 74 8, 94 26 C 82 70, 36 92, 8 70 Z" fill="#3fa33f"/><path d="M12 68 C 40 50, 64 36, 90 28" stroke="#2a7a2d" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  petal: '<svg viewBox="0 0 100 100"><path d="M50 4 C 86 18, 94 62, 50 96 C 6 62, 14 18, 50 4 Z" fill="#f06a93"/><path d="M50 14 C 72 26, 76 58, 50 84 C 36 60, 36 32, 50 14 Z" fill="#ff9dba" opacity=".75"/></svg>',
  petalLight: '<svg viewBox="0 0 100 100"><path d="M50 4 C 86 18, 94 62, 50 96 C 6 62, 14 18, 50 4 Z" fill="#ffb3c9"/><path d="M50 16 C 68 28, 72 56, 50 80" stroke="#f06a93" stroke-width="2" fill="none" opacity=".6"/></svg>',
  drop: '<svg viewBox="0 0 100 100"><path d="M50 4 C 50 4, 86 48, 86 66 A36 36 0 0 1 14 66 C 14 48, 50 4, 50 4 Z" fill="#7fd0ff" opacity=".85"/><path d="M50 4 C 50 4, 86 48, 86 66 A36 36 0 0 1 14 66 C 14 48, 50 4, 50 4 Z" fill="none" stroke="#2aa6ee" stroke-width="2"/><ellipse cx="36" cy="62" rx="7" ry="13" fill="#fff" opacity=".75" transform="rotate(-18 36 62)"/></svg>',
  sparkle: '<svg viewBox="0 0 100 100"><path d="M50 0 C 54 38, 62 46, 100 50 C 62 54, 54 62, 50 100 C 46 62, 38 54, 0 50 C 38 46, 46 38, 50 0 Z" fill="#fff"/><path d="M50 18 C 52 42, 58 48, 82 50 C 58 52, 52 58, 50 82 C 48 58, 42 52, 18 50 C 42 48, 48 42, 50 18 Z" fill="#9cc0ff"/></svg>',
  bubble: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#ffffff" opacity=".35" stroke="#8fb4ff" stroke-width="3"/><ellipse cx="34" cy="32" rx="12" ry="7" fill="#fff" transform="rotate(-35 34 32)"/></svg>',
  lavender: '<svg viewBox="0 0 100 100"><path d="M50 98 C 48 70, 52 40, 50 6" stroke="#5f8f3a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    [[50, 10], [44, 18], [56, 20], [45, 28], [55, 31], [46, 39], [54, 42], [47, 50], [53, 53]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="7" fill="${y % 2 ? '#8e5ae0' : '#a87cf0'}"/>`).join('') + '</svg>',
  jasmine: '<svg viewBox="0 0 100 100">' + [0, 72, 144, 216, 288].map(a => `<ellipse transform="rotate(${a} 50 50)" cx="50" cy="26" rx="14" ry="22" fill="#fff" stroke="#e8efe6" stroke-width="2"/>`).join('') + '<circle cx="50" cy="50" r="9" fill="#f5c542"/></svg>'
};

// Where ingredients float around the bottle: x%, y%, size (px), depth, rotation
const SLOTS = [
  [6, 10, 78, 1.2, -20], [76, 4, 60, .6, 25], [84, 52, 92, 1.5, 12], [2, 60, 58, .5, 40],
  [66, 80, 70, 1, -30], [20, 84, 52, .7, 15], [40, 0, 42, .4, 60], [92, 30, 44, .5, -45]
];

const PRODUCTS = [
  { id: 'dishwash', world: 'w-dishwash', word: 'Lemon', ing: ['lemonSlice', 'leaf', 'lemon', 'lemonSlice', 'leaf', 'lemonSlice', 'lemon', 'leaf'],
    en: { name: 'Dishwash', title: 'Grease out.<br>Shine in.', line: 'Cuts through oily utensils with the power of lemon, and stays gentle on hands.' },
    hi: { name: 'डिशवॉश', title: 'चिकनाई बाहर,<br>चमक अंदर।', line: 'नींबू की ताक़त से तेल वाले बर्तन साफ़, और हाथों पर नरम।' } },
  { id: 'toilet', world: 'w-toilet', word: 'Sparkle', ing: ['sparkle', 'bubble', 'drop', 'sparkle', 'bubble', 'sparkle', 'drop', 'bubble'],
    en: { name: 'Toilet Cleaner', title: 'Tough stains?<br>Sorted.', line: 'Removes tough stains and leaves your toilet bright, clean and fresh.' },
    hi: { name: 'टॉयलेट क्लीनर', title: 'ज़िद्दी दाग़?<br>अब नहीं।', line: 'ज़िद्दी दाग़ हटाए और टॉयलेट को चमकदार, साफ़ और ताज़ा रखे।' } },
  { id: 'floor', world: 'w-floor', word: 'Lavender', ing: ['lavender', 'petalLight', 'lavender', 'lavender', 'petalLight', 'lavender', 'lavender', 'petalLight'],
    en: { name: 'Floor Cleaner', title: 'Clean floors.<br>Lavender fresh.', line: 'Lifts everyday dirt and leaves a lavender fragrance that lasts.' },
    hi: { name: 'फ़्लोर क्लीनर', title: 'साफ़ फ़र्श,<br>महकता घर।', line: 'रोज़ की गंदगी हटाए और देर तक रहने वाली लैवेंडर ख़ुशबू छोड़े।' } },
  { id: 'glass', world: 'w-glass', word: 'Clarity', ing: ['drop', 'sparkle', 'drop', 'drop', 'drop', 'sparkle', 'drop', 'drop'],
    en: { name: 'Glass Cleaner', title: 'Streak-free.<br>Crystal clear.', line: 'A streak-free shine that clears dust and fingerprints from glass.' },
    hi: { name: 'ग्लास क्लीनर', title: 'बिना धारियाँ,<br>एकदम साफ़।', line: 'बिना धारियों की चमक, धूल और उँगलियों के निशान साफ़।' } },
  { id: 'softwash', world: 'w-softwash', word: 'Rose', ing: ['petal', 'petalLight', 'petal', 'leaf', 'petalLight', 'petal', 'petalLight', 'petal'],
    en: { name: 'Soft Wash', title: 'Soft hands.<br>Rosy fresh.', line: 'A gentle liquid hand wash with a moisturising formula and rose fragrance.' },
    hi: { name: 'सॉफ़्ट वॉश', title: 'कोमल हाथ,<br>गुलाबी ताज़गी।', line: 'मॉइस्चराइज़िंग फ़ॉर्मूला और गुलाब की ख़ुशबू वाला कोमल हैंड वॉश।' } },
  { id: 'phenyl', world: 'w-phenyl', word: 'Fresh', ing: ['jasmine', 'leaf', 'jasmine', 'leaf', 'jasmine', 'leaf', 'jasmine', 'leaf'],
    en: { name: 'White Phenyl', title: 'Deep clean.<br>Every day.', line: 'Classic white phenyl for deep-cleaning floors, with a fresh fragrance.' },
    hi: { name: 'व्हाइट फ़िनाइल', title: 'गहरी सफ़ाई,<br>हर दिन।', line: 'फ़र्श की गहरी सफ़ाई के लिए व्हाइट फ़िनाइल, ताज़ा ख़ुशबू के साथ।' } }
];
const SCENE_MS = 6500;

function initHero() {
  const scene = document.querySelector('[data-scene]');
  if (!scene) return;
  const stage = scene.querySelector('.stage');
  const img = scene.querySelector('.bottle-float img');
  const h1 = scene.querySelector('.scene-title h1');
  const line = scene.querySelector('.scene-line');
  const word = scene.querySelector('.stage-word');
  const num = scene.querySelector('.scene-count .num');
  const pname = scene.querySelector('[data-scene-name]');
  const explore = scene.querySelector('[data-scene-link]');
  const thumbs = [...scene.querySelectorAll('.thumbs button')];
  let layer = scene.querySelector('.ingredients');
  let current = 0, elapsed = 0, paused = false, onScreen = true, busy = false;

  function buildLayer(p, entering) {
    const div = document.createElement('div');
    div.className = 'ingredients' + (entering ? ' is-in' : '');
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = p.ing.map((type, i) => {
      const [x, y, s, d, r] = SLOTS[i];
      const small = window.innerWidth < 600 ? .62 : window.innerWidth > 1200 ? 1.25 : 1;
      return `<span class="ing" style="--x:${x}%;--y:${y}%;--s:${Math.round(s * small)}px;--d:${d};--z:${d > 1 ? 3 : 1};--i:${i}">` +
        `<i style="--t:${6 + (i % 3) * 1.5}s;--dl:${-i * .9}s"><span style="display:block;width:100%;height:100%;--r:${r}deg">${ING[type]}</span></i></span>`;
    }).join('');
    return div;
  }

  function setText(p) {
    const t = p[lang()];
    h1.innerHTML = t.title;
    line.innerHTML = `<strong>${t.name}</strong> · ${t.line}`;
    pname.textContent = t.name;
    explore.href = 'products.html#' + p.id;
    word.textContent = p.word;
    num.textContent = String(PRODUCTS.indexOf(p) + 1).padStart(2, '0');
    img.alt = 'Sanflix ' + p.en.name;
  }

  function show(n) {
    if (busy || n === current) return;
    const p = PRODUCTS[n];
    current = n; elapsed = 0;
    thumbs.forEach((b, k) => { b.setAttribute('aria-selected', String(k === n)); b.tabIndex = k === n ? 0 : -1; });
    PRODUCTS.forEach(q => scene.classList.remove(q.world));
    scene.classList.add(p.world);
    if (reduceMotion) {
      setText(p); img.src = 'assets/bottles/' + p.id + '.webp';
      const fresh = buildLayer(p, false); layer.replaceWith(fresh); layer = fresh;
      return;
    }
    busy = true;
    // 1. old scene leaves
    h1.classList.add('is-out'); line.classList.add('is-out'); word.classList.add('is-out'); img.classList.add('is-out');
    layer.classList.add('is-out');
    const old = layer;
    setTimeout(() => {
      // 2. swap content, place new pieces in their "before" positions
      setText(p);
      h1.classList.remove('is-out'); h1.classList.add('is-in');
      img.classList.remove('is-out'); img.classList.add('is-in');
      img.src = 'assets/bottles/' + p.id + '.webp';
      const fresh = buildLayer(p, true);
      old.replaceWith(fresh); layer = fresh;
      // 3. next frame: animate them in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        h1.classList.remove('is-in'); line.classList.remove('is-out'); word.classList.remove('is-out');
        img.classList.remove('is-in'); fresh.classList.remove('is-in');
        busy = false;
      }));
    }, 480);
  }

  // Thumbnails: click, and arrow keys like proper tabs
  thumbs.forEach((b, n) => b.addEventListener('click', () => show(n)));
  scene.querySelector('.thumbs').addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (current + (e.key === 'ArrowRight' ? 1 : PRODUCTS.length - 1)) % PRODUCTS.length;
    show(n); thumbs[n].focus();
  });
  const thumbWrap = scene.querySelector('.thumbs');
  thumbWrap.addEventListener('pointerenter', () => paused = true);
  thumbWrap.addEventListener('pointerleave', () => paused = false);
  thumbWrap.addEventListener('focusin', () => paused = true);
  thumbWrap.addEventListener('focusout', () => paused = false);
  document.addEventListener('langchange', () => setText(PRODUCTS[current]));
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(scene);

  // ----- Tilt: mouse on desktop, phone tilt on mobile (smoothed) -----
  let tx = 0, ty = 0, mx = 0, my = 0, usingTilt = false;
  scene.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 1.4)));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 1.4)));
  });
  scene.addEventListener('pointerleave', () => { if (!usingTilt) { tx = 0; ty = 0; } });
  if (!reduceMotion && window.DeviceOrientationEvent && matchMedia('(pointer: coarse)').matches) {
    let base = null;
    window.addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      usingTilt = true;
      if (base === null) base = e.beta;           // however the phone is held = neutral
      tx = Math.max(-1, Math.min(1, e.gamma / 25));
      ty = Math.max(-1, Math.min(1, (e.beta - base) / 25));
    });
  }

  // ----- Soap bubbles -----
  const canvas = scene.querySelector('.scene-bubbles');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, bubbles = [], pointer = { x: -999, y: -999 }, pops = [];
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = scene.clientWidth; H = scene.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const makeBubble = y => {
    const r = 5 + Math.random() * (W < 600 ? 14 : 24);
    return { x: W * (W < 900 ? Math.random() : .52 + Math.random() * .46), y: y ?? H + r, r, vy: .25 + Math.random() * .45, vx: 0, ph: Math.random() * 6.28 };
  };
  function drawBubble(b) {
    const g = ctx.createRadialGradient(b.x - b.r * .35, b.y - b.r * .4, b.r * .1, b.x, b.y, b.r);
    g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(.5, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,.4)');
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * .82, Math.PI * 1.1, Math.PI * 1.45); ctx.strokeStyle = 'rgba(180,140,255,.35)'; ctx.stroke();
  }
  function popAt(x, y, radius) {
    bubbles.forEach((b, i) => {
      if (Math.hypot(b.x - x, b.y - y) < b.r + radius) { pops.push({ x: b.x, y: b.y, r: b.r, t: 0 }); bubbles[i] = makeBubble(); }
    });
  }
  scene.addEventListener('pointermove', e => { const r = scene.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  scene.addEventListener('pointerleave', () => { pointer = { x: -999, y: -999 }; });
  scene.addEventListener('pointerdown', e => { const r = scene.getBoundingClientRect(); popAt(e.clientX - r.left, e.clientY - r.top, 30); });

  if (!reduceMotion) {
    sizeCanvas();
    const count = W < 600 ? 12 : 26;
    for (let i = 0; i < count; i++) bubbles.push(makeBubble(Math.random() * H));
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sizeCanvas, 150); });
  }

  // ----- One animation loop for everything -----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(now - last, 60); last = now;
    if (onScreen && !document.hidden) {
      // smooth tilt
      mx += (tx - mx) * .08; my += (ty - my) * .08;
      stage.style.setProperty('--mx', mx.toFixed(3));
      stage.style.setProperty('--my', my.toFixed(3));
      // autoplay + progress bar on the active thumbnail
      if (!paused && !busy && !reduceMotion) {
        elapsed += dt;
        if (elapsed >= SCENE_MS) show((current + 1) % PRODUCTS.length);
      }
      thumbs[current].style.setProperty('--p', Math.min(elapsed / SCENE_MS, 1).toFixed(3));
      // bubbles
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.ph += .02; b.y -= b.vy * dt / 16; b.x += Math.sin(b.ph) * .35 + b.vx; b.vx *= .94;
        const dx = b.x - pointer.x, dy = b.y - pointer.y, dist = Math.hypot(dx, dy);
        if (dist < 90 && dist > 0) { b.vx += dx / dist * .5; b.y += dy / dist * .6; }   // bubbles shy away from the cursor
        if (dist < b.r * .6) { pops.push({ x: b.x, y: b.y, r: b.r, t: 0 }); bubbles[i] = makeBubble(); continue; }
        if (b.y < -b.r) bubbles[i] = makeBubble();
        drawBubble(b);
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i]; p.t += dt / 300;
        if (p.t >= 1) { pops.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + p.t * .8), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${.8 * (1 - p.t)})`; ctx.lineWidth = 2; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    requestAnimationFrame(frame);
  }
  // Preload every bottle after the page has loaded, so switching is instant
  window.addEventListener('load', () => PRODUCTS.forEach(p => { const i = new Image(); i.src = 'assets/bottles/' + p.id + '.webp'; }));
  const first = buildLayer(PRODUCTS[0], false); layer.replaceWith(first); layer = first;
  setText(PRODUCTS[0]);
  requestAnimationFrame(frame);
}

/* ---------- 4. Wipe clean ---------- */
function initWipe() {
  const wrap = document.querySelector('[data-wipe]');
  if (!wrap) return;
  const pane = wrap.querySelector('.pane');
  const c = pane.querySelector('canvas');
  const ctx = c.getContext('2d', { willReadFrequently: true });
  let w = 0, h = 0, last = null, strokes = 0, done = false, painted = false;

  function paint() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = pane.clientWidth; h = pane.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(150, 135, 105, .55)';
    ctx.fillRect(0, 0, w, h);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w, y = rnd() * h, r = 20 + rnd() * 90;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const tone = rnd() > .5 ? '110, 92, 60' : '160, 150, 125';
      g.addColorStop(0, `rgba(${tone}, ${.25 + rnd() * .35})`);
      g.addColorStop(1, `rgba(${tone}, 0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(90, 75, 50, .18)'; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      ctx.lineWidth = 8 + rnd() * 26; ctx.beginPath();
      const x = rnd() * w, y = rnd() * h; ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + rnd() * 160 - 80, y + rnd() * 80 - 40, x + rnd() * 240 - 120, y + rnd() * 60 - 30);
      ctx.stroke();
    }
    for (let f = 0; f < 5; f++) { // fingerprints
      const fx = rnd() * w, fy = rnd() * h;
      ctx.strokeStyle = 'rgba(80, 65, 45, .22)'; ctx.lineWidth = 1.4;
      for (let k = 3; k < 22; k += 3) { ctx.beginPath(); ctx.ellipse(fx, fy, k, k * 1.35, .4, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.globalCompositeOperation = 'destination-out';
    painted = true;
  }
  function wipe(x, y) {
    const r = Math.max(34, w * .07);
    ctx.lineWidth = r * 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); ctx.stroke(); }
    else { ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    last = { x, y };
    if (++strokes % 12 === 0) check();
  }
  function check() {
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 160) { n++; if (d[i] < 40) clear++; }
    if (clear / n > .5) finish();
  }
  function finish() {
    if (done) return;
    done = true;
    wrap.classList.add('is-clean');
    if (window.gtag) gtag('event', 'wipe_clean_complete');
  }
  const pos = e => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  c.addEventListener('pointerdown', e => { pane.classList.add('started'); last = null; const p = pos(e); wipe(p.x, p.y); });
  c.addEventListener('pointermove', e => {
    // Mouse wipes on hover; a finger wipes while dragging (page scroll still works: touch-action: pan-y)
    if (e.pointerType === 'mouse' || e.buttons) { pane.classList.add('started'); const p = pos(e); wipe(p.x, p.y); }
  });
  ['pointerleave', 'pointerup', 'pointercancel'].forEach(t => c.addEventListener(t, () => { last = null; }));

  wrap.querySelector('.pane-auto').addEventListener('click', () => {
    if (reduceMotion) return finish();
    pane.classList.add('started'); last = null; let t = 0;
    (function sweep() {
      t += 0.03;
      const row = Math.floor(t * 4), fx = row % 2 ? 1 - (t * 4 % 1) : (t * 4 % 1);
      wipe(fx * w, (row + .5) * h / 5);
      if (t < 1.3 && !done) requestAnimationFrame(sweep); else finish();
    })();
  });

  // Only paint the dirt once the section is near the screen
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { paint(); obs.disconnect(); }
  }, { rootMargin: '300px' }).observe(pane);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (painted && !done && pane.clientWidth !== w) { last = null; paint(); } }, 200); });
}

/* ---------- 5. Reveal on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || reduceMotion || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach(i => io.observe(i));
}

/* ---------- 6. Enquiry form ---------- */
function initForm() {
  const form = document.getElementById('enquiry-form');
  if (!form) return;
  const biz = form.querySelector('.biz-fields');
  const types = form.querySelectorAll('input[name="Enquiry Type"]');
  const params = new URLSearchParams(location.search);

  // Pre-fill from links like contact.html?type=retailer&product=Dishwash
  const wanted = params.get('type');
  if (wanted) types.forEach(t => { if (t.value.toLowerCase().startsWith(wanted)) t.checked = true; });
  const product = params.get('product');
  const productField = form.querySelector('[name="Product of interest"]');
  if (product && productField) productField.value = product;

  const syncBiz = () => {
    const checked = form.querySelector('input[name="Enquiry Type"]:checked');
    const isConsumer = !checked || checked.value === 'Consumer';
    if (biz) biz.hidden = isConsumer;
  };
  types.forEach(t => t.addEventListener('change', syncBiz));
  syncBiz();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const error = form.querySelector('.form-error');
    const button = form.querySelector('button[type="submit"]');
    const success = document.getElementById('form-success');
    error.hidden = true;
    button.disabled = true;
    const label = button.innerHTML;
    button.textContent = lang() === 'hi' ? 'भेजा जा रहा है…' : 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Submission failed');
      form.hidden = true;
      success.hidden = false;
      success.focus();
      if (window.gtag) gtag('event', 'generate_lead', { enquiry_type: (form.querySelector('input[name="Enquiry Type"]:checked') || {}).value });
    } catch (err) {
      error.hidden = false;
      button.disabled = false;
      button.innerHTML = label;
    }
  });
}

/* ---------- 7. Sanflix Assistant ---------- */
// Simple keyword matching, no server. Answers are checked in order: specific ones first.
const CHAT = [
  { k: ['whatsapp', 'whats app', 'व्हाट्सएप'],
    en: 'You can WhatsApp us on +91 81688 00195. Tap the green WhatsApp button to start a chat.',
    hi: 'आप हमें +91 81688 00195 पर WhatsApp कर सकते हैं। चैट शुरू करने के लिए हरे WhatsApp बटन पर टैप करें।' },
  { k: ['retail', 'dealer', 'distribut', 'stock', 'shop', 'dukan', 'दुकान', 'डीलर', 'रिटेलर', 'डिस्ट्रीब्यूटर', 'wholesale', 'margin'],
    en: 'Great! We welcome retailers and distributors. Share your details on the "For retailers" page, or WhatsApp us, and our team will send pricing and next steps.',
    hi: 'बढ़िया! हम रिटेलर और डिस्ट्रीब्यूटर का स्वागत करते हैं। "रिटेलर के लिए" पेज पर अपनी जानकारी भेजें या WhatsApp करें, हमारी टीम आपको दाम और आगे की जानकारी भेजेगी।' },
  { k: ['bulk', 'institution', 'hotel', 'office', 'school', 'hospital', 'society', 'थोक'],
    en: 'For bulk or institutional orders, choose "Bulk / Institutional" on the enquiry form and tell us roughly how much you need each month. We will get back to you directly.',
    hi: 'थोक या संस्थागत ऑर्डर के लिए, एन्क्वायरी फ़ॉर्म में "थोक / संस्था" चुनें और हर महीने की अनुमानित ज़रूरत बताएँ। हम आपसे सीधे संपर्क करेंगे।' },
  { k: ['price', 'rate', 'cost', 'mrp', 'daam', 'kitne', 'दाम', 'कीमत', 'रेट'],
    en: 'Prices depend on the product, pack size and quantity. Send an enquiry or WhatsApp us and we will share current prices.',
    hi: 'दाम प्रोडक्ट, पैक साइज़ और मात्रा पर निर्भर करते हैं। एन्क्वायरी भेजें या WhatsApp करें, हम मौजूदा दाम बता देंगे।' },
  { k: ['size', 'litre', 'liter', 'ml', '5l', 'pack', 'साइज़', 'लीटर'],
    en: 'Our products come in 500 ml, 1 litre and 5 litre packs. Ask us which sizes are in stock near you.',
    hi: 'हमारे प्रोडक्ट 500 ml, 1 लीटर और 5 लीटर पैक में आते हैं। आपके पास कौन-से साइज़ मिलेंगे, हमसे पूछें।' },
  { k: ['online', 'amazon', 'flipkart', 'buy', 'order', 'kharid', 'ख़रीद', 'खरीद'],
    en: 'We do not sell online yet. Sanflix is available through local shops. Contact us and we will tell you where to find it near you.',
    hi: 'अभी हम ऑनलाइन नहीं बेचते। Sanflix लोकल दुकानों पर मिलता है। हमसे संपर्क करें, हम आपको पास की दुकान बताएँगे।' },
  { k: ['where', 'available', 'city', 'area', 'deliver', 'kahan', 'कहाँ', 'कहां'],
    en: 'We are growing our shop network step by step. Tell us your city on the enquiry form or on WhatsApp and we will let you know availability.',
    hi: 'हम धीरे-धीरे अपना दुकानों का नेटवर्क बढ़ा रहे हैं। एन्क्वायरी फ़ॉर्म या WhatsApp पर अपना शहर बताएँ, हम उपलब्धता बता देंगे।' },
  { k: ['safe', 'child', 'skin', 'hand', 'सुरक्षित', 'बच्च'],
    en: 'Sanflix products are made for everyday home use. Always follow the directions on the label and keep cleaning products out of reach of children.',
    hi: 'Sanflix प्रोडक्ट रोज़ के घरेलू इस्तेमाल के लिए बने हैं। हमेशा लेबल पर लिखे निर्देश मानें और सफ़ाई के प्रोडक्ट बच्चों की पहुँच से दूर रखें।' },
  { k: ['product', 'range', 'toilet', 'floor', 'dish', 'glass', 'phenyl', 'soap', 'wash', 'cleaner', 'प्रोडक्ट'],
    en: 'We make six products: Toilet Cleaner, Floor Cleaner, Dishwash, Glass Cleaner, Soft Wash hand wash and White Phenyl. See them all on the Products page.',
    hi: 'हम छह प्रोडक्ट बनाते हैं: टॉयलेट क्लीनर, फ़्लोर क्लीनर, डिशवॉश, ग्लास क्लीनर, सॉफ़्ट वॉश हैंड वॉश और व्हाइट फ़िनाइल। सभी प्रोडक्ट्स पेज पर देखें।' },
  { k: ['address', 'located', 'factory', 'narnaul', 'पता'],
    en: 'Sanflix is made by Kedar Consumer Products, 196/25, Near Old Court, Shivaji Nagar, Narnaul, Haryana 123001.',
    hi: 'Sanflix को Kedar Consumer Products बनाती है, 196/25, पुरानी कोर्ट के पास, शिवाजी नगर, नारनौल, हरियाणा 123001।' },
  { k: ['contact', 'call', 'phone', 'email', 'number', 'reach', 'संपर्क', 'फ़ोन', 'नंबर'],
    en: 'WhatsApp: +91 81688 00195 · Email: info@sanflix.in. Or use the enquiry form on the Contact page. We usually reply within 1–2 business days.',
    hi: 'WhatsApp: +91 81688 00195 · ईमेल: info@sanflix.in। या संपर्क पेज पर एन्क्वायरी फ़ॉर्म भरें। हम आमतौर पर 1–2 कामकाजी दिनों में जवाब देते हैं।' },
  { k: ['hi', 'hello', 'hey', 'namaste', 'नमस्ते'],
    en: 'Namaste! Ask me about our products, prices, pack sizes or becoming a retailer.',
    hi: 'नमस्ते! हमारे प्रोडक्ट, दाम, पैक साइज़ या रिटेलर बनने के बारे में पूछें।' }
];
const CHAT_FALLBACK = {
  en: 'I can help with products, prices, pack sizes, availability and retailer enquiries. For anything else, WhatsApp us on +91 81688 00195.',
  hi: 'मैं प्रोडक्ट, दाम, पैक साइज़, उपलब्धता और रिटेलर एन्क्वायरी में मदद कर सकता हूँ। बाक़ी किसी भी बात के लिए +91 81688 00195 पर WhatsApp करें।'
};

function initChat() {
  const panel = document.getElementById('chat-panel');
  if (!panel) return;
  const body = panel.querySelector('.chat-body');
  const form = panel.querySelector('.chat-input');
  const input = form.querySelector('input');
  const openers = document.querySelectorAll('[data-chat-open]');

  const answer = text => {
    const t = text.toLowerCase();
    const hit = CHAT.find(entry => entry.k.some(k => (k.length <= 3 ? new RegExp('\\b' + k + '\\b').test(t) : t.includes(k))));
    return (hit || CHAT_FALLBACK)[lang()];
  };
  const add = (text, who) => {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  };
  const ask = text => {
    add(text, 'user');
    setTimeout(() => add(answer(text), 'bot'), 350);
  };

  const open = () => {
    panel.hidden = false;
    openers.forEach(o => o.setAttribute('aria-expanded', 'true'));
    if (!body.children.length) add(lang() === 'hi' ? 'नमस्ते! मैं Sanflix असिस्टेंट हूँ। प्रोडक्ट, दाम या रिटेलर बनने के बारे में पूछें।' : 'Namaste! I am the Sanflix Assistant. Ask me about products, prices or becoming a retailer.', 'bot');
    input.focus();
  };
  const close = () => { panel.hidden = true; openers.forEach(o => o.setAttribute('aria-expanded', 'false')); };
  openers.forEach(o => o.addEventListener('click', () => (panel.hidden ? open() : close())));
  panel.querySelector('[data-chat-close]').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  panel.querySelectorAll('.chat-quick button').forEach(b => b.addEventListener('click', () => ask((b.querySelector(lang() === 'hi' ? '.t-hi' : '.t-en') || b).textContent.trim())));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    ask(text);
  });
}
