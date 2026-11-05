/*!
 * Glyph Static — runtime  ·  v1.0.0
 * unbland — https://unbland.dev
 *
 * Free to use in any project, commercial or personal, under the Unbland Free
 * Effect Licence. See LICENSE.txt. Keep this comment. Do not resell it or
 * republish it as your own effect.
 *
 * Text resolves out of noise. Each character cycles through substitute glyphs
 * and then locks to the one it was always going to be, with the settling front
 * running through the line.
 *
 * Usage:
 *   <h1 id="headline">Type under instrumentation</h1>
 *   <script src="glyph-static.js"></script>
 *   <script>UnblandGlyphStatic.create('#headline');</script>
 *
 * Each unbland effect is a single file with no dependencies, so the text
 * splitting here is deliberately its own copy rather than a shared module.
 * One file that a person can drop into any project is the product; a runtime
 * they have to assemble from parts is not.
 */
(function (global) {
'use strict';

const DEFAULTS = {
  /* Latin, digits and a few marks. Deliberately not the full ASCII range: the
     punctuation-heavy end of it reads as corruption rather than as static, and
     the glyphs with large side bearings make the line flicker in width. */
  glyphs:     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  duration:   1100,   // ms from first character starting to last one locking
  settle:     380,    // ms any one character spends scrambling before it locks
  fps:        22,     // glyph swaps per second — far below the frame rate on purpose
  trigger:    'view', // 'view' | 'hover' | 'load' | 'manual'
  threshold:  0.4,    // how much of the element must be visible for 'view'
  once:       true,   // 'view' and 'hover' replay unless this is true
  accent:     '',     // colour for a character while it is still scrambling
  credit:     true,
};

const CSS = `
.gs-root{display:inline}
.gs-w{display:inline-block;white-space:nowrap}
.gs-c{display:inline-block;text-align:center}
/* Locked to the real character's width before any substitute is shown, so a
   wide stand-in cannot rewrap the line. See LOCKING in the source. */
.gs-c[data-gs-live]{color:var(--gs-accent,inherit)}
`;

/* ── LOCKING ───────────────────────────────────────────────────────────
   Every substitute glyph is a different width from the character it stands in
   for, so an unlocked line changes width on every swap — at 22 swaps a second,
   across a whole heading, the text visibly shivers and anything after it moves.

   The real character is measured first, before the first substitute is ever
   shown, and its box is fixed at that width. Substitutes are then centred in
   the box the final text will occupy. The line never moves, and the layout
   after the effect finishes is the layout that was there all along. */

let styled = false;
function injectCSS(doc) {
  if (styled || doc.getElementById('gs-style')) { styled = true; return; }
  const s = doc.createElement('style');
  s.id = 'gs-style';
  s.textContent = CSS;
  doc.head.appendChild(s);
  styled = true;
}

function warn(msg) { console.warn('[Glyph Static] ' + msg); }

function create(target, options) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) { warn(`no element matches ${target}`); return null; }
  if (host.__glyphStatic) { warn('already running on this element; destroying the old one'); host.__glyphStatic.destroy(); }

  const cfg = Object.assign({}, DEFAULTS, options || {});
  const doc = host.ownerDocument;
  const pool = Array.from(String(cfg.glyphs || ''));
  if (!pool.length) { warn('no glyphs to scramble with'); return null; }

  injectCSS(doc);

  const text = host.textContent;
  const original = Array.from(host.childNodes);

  /* ── split ───────────────────────────────────────────────────────────
     Words wrap characters so lines still break between words, and the split
     spans are hidden from assistive technology with the original string put
     back on the host as its label. Text that is mid-scramble is nonsense, and
     a screen reader must never be handed it. */
  const root = doc.createElement('span');
  root.className = 'gs-root';
  root.setAttribute('aria-hidden', 'true');
  if (cfg.accent) root.style.setProperty('--gs-accent', cfg.accent);

  const chars = [];
  for (const part of text.split(/(\s+)/)) {
    if (part === '') continue;
    if (/^\s+$/.test(part)) { root.appendChild(doc.createTextNode(part)); continue; }
    const word = doc.createElement('span');
    word.className = 'gs-w';
    for (const ch of Array.from(part)) {
      const c = doc.createElement('span');
      c.className = 'gs-c';
      c.textContent = ch;
      word.appendChild(c);
      chars.push({ el: c, ch, start: 0, shown: ch });
    }
    root.appendChild(word);
  }
  if (!chars.length) { warn('the element has no text to scramble'); return null; }

  const hadLabel = host.hasAttribute('aria-label');
  if (!hadLabel) host.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
  host.textContent = '';
  host.appendChild(root);

  /* Measure the real characters, then lock. Reads first, writes second, so the
     loop does not thrash layout. */
  function lock() {
    const rects = chars.map((c) => c.el.getBoundingClientRect());
    for (let i = 0; i < chars.length; i++) chars[i].el.style.width = rects[i].width.toFixed(3) + 'px';
  }
  lock();

  /* ── casting ─────────────────────────────────────────────────────────
     A substitute is not interchangeable with the character it stands in for.
     Locking an `i` to its own width and then dropping a `W` into that box
     puts the W straight through its neighbours — on the first build of this
     effect the scrambling middle of the line was visibly a pile-up.

     So each character gets its own shortlist: the pool glyphs closest to it in
     width, measured once in the host's real font. The scramble still looks
     random — nobody reads individual frames at this speed — but every
     substitute fits the box it is dropped into, and the line stays clean.

     One measuring pass over the pool at init. All reads, no writes between
     them, and the ruler is removed before anything else happens. */
  function castPool() {
    const ruler = doc.createElement('span');
    ruler.className = 'gs-c';
    ruler.setAttribute('aria-hidden', 'true');
    ruler.style.cssText = 'position:absolute;visibility:hidden;width:auto;white-space:pre';
    root.appendChild(ruler);

    const widths = new Array(pool.length);
    for (let i = 0; i < pool.length; i++) {
      ruler.textContent = pool[i];
      widths[i] = ruler.getBoundingClientRect().width;
    }
    ruler.remove();

    /* Six is enough that the sequence never reads as a repeat, and few enough
       that the widths stay genuinely close on a narrow character. */
    const SHORTLIST = 6;
    for (const c of chars) {
      if (c.ch === ' ') { c.cast = [' ']; continue; }
      const w = c.el.getBoundingClientRect().width;
      const order = widths
        .map((gw, i) => ({ i, d: Math.abs(gw - w) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, SHORTLIST);
      c.cast = order.map((o) => pool[o.i]);
    }
  }
  castPool();

  /* Each character starts at a point spread across the run and scrambles for
     `settle` before locking. Computed once — a stagger recomputed per frame
     would make the front jitter. */
  const span = Math.max(0, cfg.duration - cfg.settle);
  for (let i = 0; i < chars.length; i++) {
    chars[i].start = chars.length > 1 ? (i / (chars.length - 1)) * span : 0;
  }

  const reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reduced && reduced.matches;

  let raf = 0, t0 = 0, running = false, done = false, destroyed = false;
  let lastSwap = 0;

  function setChar(c, ch, live) {
    if (c.shown !== ch) { c.el.textContent = ch; c.shown = ch; }
    if (live && !c.live) { c.el.setAttribute('data-gs-live', ''); c.live = true; }
    else if (!live && c.live) { c.el.removeAttribute('data-gs-live'); c.live = false; }
  }

  function finish() {
    for (const c of chars) setChar(c, c.ch, false);
    running = false; done = true;
    if (raf) { global.cancelAnimationFrame(raf); raf = 0; }
  }

  function frame(now) {
    raf = 0;
    if (destroyed) return;
    if (!t0) t0 = now;
    const t = now - t0;

    /* Glyphs swap on their own clock, well below the display's. A substitute
       that changes every frame is a grey blur; at around 22 a second the eye
       reads individual characters, which is what makes it look like static
       resolving rather than a loading shimmer. */
    const swap = now - lastSwap >= 1000 / cfg.fps;
    if (swap) lastSwap = now;

    let pending = false;
    for (const c of chars) {
      if (t < c.start) { setChar(c, ' ', false); pending = true; continue; }
      if (t >= c.start + cfg.settle) { setChar(c, c.ch, false); continue; }
      pending = true;
      /* A space stays a space. Scrambling it would open and close a gap in the
         middle of a word and read as a typo. */
      if (c.ch === ' ') { setChar(c, ' ', false); continue; }
      if (swap || c.shown === ' ') setChar(c, c.cast[(Math.random() * c.cast.length) | 0], true);
    }

    if (pending) raf = global.requestAnimationFrame(frame);
    else finish();
  }

  function play() {
    if (destroyed) return;
    if (motionOff()) { finish(); return; }   /* the text, immediately, as written */
    if (running) return;
    running = true; done = false; t0 = 0; lastSwap = 0;
    raf = global.requestAnimationFrame(frame);
  }

  /* Triggers that will fire on their own blank the text first, or the real
     words sit there and then vanish to resolve back in — the flash reads as a
     fault. 'hover' is not pre-staged: its resting state is the text itself.

     If the motion is off, nothing is staged and the text simply stays put. */
  if ((cfg.trigger === 'view' || cfg.trigger === 'load') && !motionOff()) {
    for (const c of chars) setChar(c, ' ', false);
  }

  /* ── triggers ────────────────────────────────────────────────────────── */
  let io = null, onEnter = null;

  if (cfg.trigger === 'view') {
    if (global.IntersectionObserver) {
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          play();
          if (cfg.once) { io.disconnect(); io = null; }
        }
      }, { threshold: cfg.threshold });
      io.observe(host);
    } else {
      play();   /* no observer: better seen once than never */
    }
  } else if (cfg.trigger === 'hover') {
    onEnter = () => { if (!cfg.once || !done) play(); };
    host.addEventListener('pointerenter', onEnter, { passive: true });
    /* Hover has no resting state of its own, so the text starts as itself and
       the first hover is what scrambles it. */
  } else if (cfg.trigger === 'load') {
    play();
  }

  const onReduced = () => { if (motionOff()) finish(); };
  if (reduced && reduced.addEventListener) reduced.addEventListener('change', onReduced);

  /* A late webfont changes every width that was locked above. */
  if (doc.fonts && doc.fonts.status !== 'loaded') {
    doc.fonts.ready.then(() => {
      if (destroyed) return;
      for (const c of chars) c.el.style.width = '';
      const held = chars.map((c) => c.shown);
      for (let i = 0; i < chars.length; i++) setChar(chars[i], chars[i].ch, false);
      lock();
      castPool();   /* every width above was the fallback font's */
      for (let i = 0; i < chars.length; i++) if (held[i] !== chars[i].ch) setChar(chars[i], held[i], true);
    });
  }

  if (cfg.credit) console.log('Glyph Static — a free unbland effect · https://unbland.dev');

  const api = {
    play,
    /* Put the real text back without animating — for a route change, or a
       "skip" control the page offers. */
    reveal: finish,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (raf) { global.cancelAnimationFrame(raf); raf = 0; }
      if (io) io.disconnect();
      if (onEnter) host.removeEventListener('pointerenter', onEnter);
      if (reduced && reduced.removeEventListener) reduced.removeEventListener('change', onReduced);
      if (!hadLabel) host.removeAttribute('aria-label');
      host.textContent = '';
      for (const n of original) host.appendChild(n);
      delete host.__glyphStatic;
    },
    get element() { return host; },
  };
  host.__glyphStatic = api;
  return api;
}

global.UnblandGlyphStatic = { create, DEFAULTS };

})(typeof window !== 'undefined' ? window : globalThis);
