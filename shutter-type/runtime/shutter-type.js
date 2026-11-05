/*!
 * Shutter Type — runtime  ·  v1.0.0
 * unbland — https://unbland.dev
 *
 * Free to use in any project, commercial or personal, under the Unbland Free
 * Effect Licence. See LICENSE.txt. Keep this comment. Do not resell it or
 * republish it as your own effect.
 *
 * Each character is clipped to its own box and slides out from under that
 * edge, with the reveal sweeping across the block as a single front. The
 * shutter is the clipping edge itself; there is nothing drawn over the text.
 *
 * Usage:
 *   <h1 id="headline">Uncovered, not faded</h1>
 *   <script src="shutter-type.js"></script>
 *   <script>UnblandShutterType.create('#headline');</script>
 *
 * Each unbland effect is a single file with no dependencies, so the text
 * splitting here is deliberately its own copy rather than a shared module.
 * One file a person can drop into any project is the product; a runtime they
 * have to assemble from parts is not.
 */
(function (global) {
'use strict';

const DEFAULTS = {
  duration:   900,      // ms for the reveal to cross the whole block
  settle:     520,      // ms any one character takes to arrive
  from:       'below',  // 'below' | 'above' | 'behind'
  sweep:      'auto',   // 'ltr' | 'rtl' | 'auto' — 'auto' follows the element's direction
  trigger:    'view',   // 'view' | 'hover' | 'load' | 'manual'
  threshold:  0.4,
  once:       true,
  credit:     true,
};

/* ── CLIPPING ──────────────────────────────────────────────────────────
   Each character is a box with overflow:hidden and the glyph slides inside it.
   The obvious version of that clips the descenders off g, j, p, q and y,
   because an inline box is only as tall as the line box and the descender
   hangs below it.

   The padding here opens the clipping region above and below, and the equal
   negative margin takes the space straight back, so the layout box is exactly
   what it would have been — the line height, the wrapping and everything
   around the text are untouched. The reveal edge then sits just under the
   descender line, which is where a letter should appear to come from. */
const CSS = `
.st-root{display:inline-block;position:relative}
.st-w{display:inline-block;white-space:nowrap}
.st-c{display:inline-block;overflow:hidden;
  padding-block:.26em .3em;margin-block:-.26em -.3em;vertical-align:baseline}
.st-g{display:inline-block;will-change:transform}
@media (prefers-reduced-motion:reduce){
  .st-g{will-change:auto;transform:none!important}
}
`;

let styled = false;
function injectCSS(doc) {
  if (styled || doc.getElementById('st-style')) { styled = true; return; }
  const s = doc.createElement('style');
  s.id = 'st-style';
  s.textContent = CSS;
  doc.head.appendChild(s);
  styled = true;
}

function warn(msg) { console.warn('[Shutter Type] ' + msg); }

/* Decelerating, so a character arrives rather than stops. */
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function create(target, options) {
  const host = typeof target === 'string' ? document.querySelector(target) : target;
  if (!host) { warn(`no element matches ${target}`); return null; }
  if (host.__shutterType) { warn('already running on this element; destroying the old one'); host.__shutterType.destroy(); }

  const cfg = Object.assign({}, DEFAULTS, options || {});
  const doc = host.ownerDocument;
  injectCSS(doc);

  const text = host.textContent;
  const original = Array.from(host.childNodes);

  const root = doc.createElement('span');
  root.className = 'st-root';
  root.setAttribute('aria-hidden', 'true');

  const chars = [];
  for (const part of text.split(/(\s+)/)) {
    if (part === '') continue;
    if (/^\s+$/.test(part)) { root.appendChild(doc.createTextNode(part)); continue; }
    const word = doc.createElement('span');
    word.className = 'st-w';
    for (const ch of Array.from(part)) {
      const box = doc.createElement('span');
      box.className = 'st-c';
      const glyph = doc.createElement('span');
      glyph.className = 'st-g';
      glyph.textContent = ch;
      box.appendChild(glyph);
      word.appendChild(box);
      chars.push({ box, glyph, x: 0, start: 0, at: -1 });
    }
    root.appendChild(word);
  }
  if (!chars.length) { warn('the element has no text to reveal'); return null; }

  const hadLabel = host.hasAttribute('aria-label');
  if (!hadLabel) host.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
  host.textContent = '';
  host.appendChild(root);

  const reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reduced && reduced.matches;

  /* Right-to-left text should be uncovered from the right, or the reveal runs
     backwards through the sentence. Read from the element rather than asked
     for, so it is right by default on a Hebrew or Arabic page. */
  function sweepDir() {
    if (cfg.sweep === 'ltr' || cfg.sweep === 'rtl') return cfg.sweep;
    const dir = (global.getComputedStyle(host).direction || 'ltr').toLowerCase();
    return dir === 'rtl' ? 'rtl' : 'ltr';
  }

  /* The span the stagger is normalised against: the first character's edge to
     the last one's, not the element's box. On a centred or wrapped heading the
     box is wider than any line in it, so measuring against the box would leave
     the reveal still running after the last letter had already arrived. */
  let x0 = 0, x1 = 0, rtl = false;

  /* ── measure ─────────────────────────────────────────────────────────
     The stagger follows each character's position across the block, not its
     index in the text. On a heading that wraps, index order would run along
     line one and then start line two over at the left, so the reveal would jump
     backwards mid-heading. Position order makes it one front crossing the whole
     block, however many lines the text happens to take. */
  function measure() {
    const r = root.getBoundingClientRect();
    rtl = sweepDir() === 'rtl';
    const rects = chars.map((c) => c.box.getBoundingClientRect());

    x0 = Infinity; x1 = -Infinity;
    for (const rect of rects) {
      x0 = Math.min(x0, rect.left - r.left);
      x1 = Math.max(x1, rect.right - r.left);
    }
    const span = Math.max(1, x1 - x0);

    for (let i = 0; i < chars.length; i++) {
      const cx = rects[i].left + rects[i].width / 2 - r.left;
      chars[i].x = cx;
      const p = (cx - x0) / span;
      chars[i].start = (rtl ? 1 - p : p) * Math.max(0, cfg.duration - cfg.settle);
    }

  }
  measure();

  /* The hidden state. 'behind' holds the glyph in place and fades it, for
     text whose own position must not move at all. */
  function hiddenTransform() {
    if (cfg.from === 'above') return 'translateY(-110%)';
    if (cfg.from === 'behind') return 'none';
    return 'translateY(110%)';
  }

  function setChar(c, t) {
    /* Quantised, so a character that has not moved enough to repaint does not
       get a style write. */
    const q = Math.round(t * 200) / 200;
    if (c.at === q) return;
    c.at = q;
    if (q >= 1) { c.glyph.style.transform = 'none'; c.glyph.style.opacity = ''; return; }
    const e = easeOut(q);
    if (cfg.from === 'behind') {
      c.glyph.style.transform = 'none';
      c.glyph.style.opacity = e.toFixed(3);
    } else {
      const sign = cfg.from === 'above' ? -1 : 1;
      c.glyph.style.transform = `translateY(${(sign * (1 - e) * 110).toFixed(2)}%)`;
      c.glyph.style.opacity = '';
    }
  }

  function hideAll() { for (const c of chars) { c.at = -1; setChar(c, 0); } }
  function showAll() {
    for (const c of chars) { c.at = 1; c.glyph.style.transform = 'none'; c.glyph.style.opacity = ''; }
  }

  let raf = 0, t0 = 0, running = false, done = false, destroyed = false;

  function frame(now) {
    raf = 0;
    if (destroyed) return;
    if (!t0) t0 = now;
    const t = now - t0;

    let pending = false;
    for (const c of chars) {
      const local = cfg.settle > 0 ? (t - c.start) / cfg.settle : 1;
      const clamped = local <= 0 ? 0 : local >= 1 ? 1 : local;
      setChar(c, clamped);
      if (clamped < 1) pending = true;
    }

    if (pending) raf = global.requestAnimationFrame(frame);
    else { running = false; done = true; showAll(); }
  }

  function play() {
    if (destroyed) return;
    if (motionOff()) { showAll(); done = true; return; }
    if (running) return;
    measure();
    hideAll();
    running = true; done = false; t0 = 0;
    raf = global.requestAnimationFrame(frame);
  }

  function reveal() {
    if (raf) { global.cancelAnimationFrame(raf); raf = 0; }
    running = false; done = true;
    showAll();
  }

  /* Staged hidden before the trigger fires, or the text is visible and then
     vanishes to be revealed again. 'hover' keeps the text as its own resting
     state, so it is not staged. */
  if ((cfg.trigger === 'view' || cfg.trigger === 'load') && !motionOff()) hideAll();

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
      play();
    }
  } else if (cfg.trigger === 'hover') {
    onEnter = () => { if (!cfg.once || !done) play(); };
    host.addEventListener('pointerenter', onEnter, { passive: true });
  } else if (cfg.trigger === 'load') {
    play();
  }

  const onReduced = () => { if (motionOff()) reveal(); };
  if (reduced && reduced.addEventListener) reduced.addEventListener('change', onReduced);

  /* A resize rewraps the text, so every cached position and therefore every
     start time is wrong. Mid-run that would tear; finished, it only needs the
     next run to be right. */
  let ro = null;
  if (global.ResizeObserver) {
    ro = new ResizeObserver(() => { if (!running) measure(); });
    ro.observe(host);
  }
  if (doc.fonts && doc.fonts.status !== 'loaded') {
    doc.fonts.ready.then(() => { if (!destroyed && !running) measure(); });
  }

  if (cfg.credit) console.log('Shutter Type — a free unbland effect · https://unbland.dev');

  const api = {
    play,
    reveal,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (raf) { global.cancelAnimationFrame(raf); raf = 0; }
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      if (onEnter) host.removeEventListener('pointerenter', onEnter);
      if (reduced && reduced.removeEventListener) reduced.removeEventListener('change', onReduced);
      if (!hadLabel) host.removeAttribute('aria-label');
      host.textContent = '';
      for (const n of original) host.appendChild(n);
      delete host.__shutterType;
    },
    get element() { return host; },
  };
  host.__shutterType = api;
  return api;
}

global.UnblandShutterType = { create, DEFAULTS };

})(typeof window !== 'undefined' ? window : globalThis);
