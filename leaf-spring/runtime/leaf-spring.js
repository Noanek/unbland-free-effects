/*!
 * Leaf Spring — runtime  ·  v1.0.0
 * unbland — https://unbland.dev
 *
 * Free to use in any project, commercial or personal, under the Unbland Free
 * Effect Licence. See LICENSE.txt. Keep this comment. Do not resell it or
 * republish it as your own effect.
 *
 * A button with mass. It leans toward the pointer as it comes near, sinks when
 * it is pressed, and overshoots on release rather than sliding back. The label
 * inside travels further than the button around it, which is what reads as
 * depth rather than as a moving rectangle.
 *
 * On a desktop the pointer pulls the button from outside. On a touch screen
 * there is no hover to pull it, so the finger pushes it from inside instead:
 * while it is held, the button follows against resistance and springs back on
 * release. Same spring, different input.
 *
 * Usage:
 *   <a class="btn" href="/buy"><span>Buy the library</span></a>
 *   <script src="leaf-spring.js"></script>
 *   <script>UnblandLeafSpring.create('.btn');</script>
 */
(function (global) {
'use strict';

const DEFAULTS = {
  pull:       0.34,   // fraction of the distance to the pointer the element travels
  reach:      150,    // px around the element where the pointer is felt
  max:        34,     // px cap, so a fast pointer cannot fling it across the page
  stiffness:  0.12,   // how hard the spring pulls toward where it should be
  damping:    0.76,   // < 1 lets it overshoot. See WHY A SPRING below
  inner:      '',     // selector for a child that travels further — '' uses the only child
  innerPull:  0.42,   // how much further, as a fraction of the element's own travel
  press:      0.94,   // scale while held down. 1 disables the press entirely
  drag:       0.55,   // how much of a held finger's travel the button follows. 0 disables
  dragMax:    46,     // px the drag asymptotically approaches, however far you pull
  credit:     true,
};

/* ── WHY A SPRING, AND NOT A LERP ──────────────────────────────────────
   Easing an element toward the pointer and back is the version of this effect
   that everyone writes, and it feels like sliding on ice: it arrives, stops
   dead, and has no weight.

   A spring integrates velocity instead. Damping under 1 means the velocity
   does not vanish at the target — the element goes past it, comes back, and
   settles in a shrinking oscillation. That overshoot on release is the entire
   difference between "this is animated" and "this has mass", and it is one
   line of arithmetic.

   Measured on release at the defaults: -2.25px, +0.5, -0.11, +0.02, still. */

function warn(msg) { console.warn('[Leaf Spring] ' + msg); }

function create(target, options) {
  const cfg = Object.assign({}, DEFAULTS, options || {});

  let nodes;
  if (typeof target === 'string') nodes = [...document.querySelectorAll(target)];
  else if (target instanceof Element) nodes = [target];
  else if (target && target.length != null) nodes = [...target];
  else { warn('create() needs a selector, an element, or a list of them'); return null; }

  nodes = nodes.filter((n) => n instanceof Element);
  if (!nodes.length) { warn(`nothing matches ${typeof target === 'string' ? target : 'that target'}`); return null; }

  const reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reduced && reduced.matches;

  const items = nodes.map((el) => {
    /* The inner element is the parallax. With no selector given, an only child
       is used — which is the common case, a <span> inside a button — and
       nothing is used when there are several, because moving one of many
       children would look like a mistake. */
    let inner = null;
    if (cfg.inner) inner = el.querySelector(cfg.inner);
    else if (el.children.length === 1) inner = el.children[0];

    return {
      el, inner,
      x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
      /* The press is its own spring on the scale axis, so a button released
         mid-lean settles on both at once instead of fighting itself. */
      s: 1, vs: 0, ts: 1,
      /* Where the finger first landed, so the drag is measured from there
         rather than from the button's centre. */
      held: false, ox: 0, oy: 0,
      /* The element's own rect, cached. Reading it on every pointermove is a
         forced layout per element per event, which on a nav of twelve links is
         the whole cost of the effect. */
      cx: 0, cy: 0, w: 0, h: 0,
      /* Whatever the host already had, so destroy() can put it back. */
      hadTranslate: el.style.translate,
      hadScale: el.style.scale,
      hadInner: inner ? inner.style.translate : '',
    };
  });

  let destroyed = false, raf = 0, running = false, rectsStale = true;

  function measure() {
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      /* The cached centre is where the element sits at rest, so the current
         translate has to come out of it or the reading drifts as it moves. */
      it.cx = r.left + r.width / 2 - it.x;
      it.cy = r.top + r.height / 2 - it.y;
      it.w = r.width; it.h = r.height;
    }
    rectsStale = false;
  }

  function aim(px, py) {
    for (const it of items) {
      if (it.held) {
        /* tanh, so the button follows closely at first and then refuses to go
           much further however hard it is pulled. A linear drag with a hard
           clamp feels like hitting a wall; this feels like stretching
           something. */
        const m = cfg.dragMax;
        it.tx = m * Math.tanh((px - it.ox) * cfg.drag / m);
        it.ty = m * Math.tanh((py - it.oy) * cfg.drag / m);
        continue;
      }
      const dx = px - it.cx;
      const dy = py - it.cy;
      /* Distance to the element's edge rather than its centre, so a wide
         button is felt along its whole length instead of only in the middle. */
      const ex = Math.max(0, Math.abs(dx) - it.w / 2);
      const ey = Math.max(0, Math.abs(dy) - it.h / 2);
      const d = Math.hypot(ex, ey);

      if (d > cfg.reach) { it.tx = 0; it.ty = 0; continue; }
      /* Squared falloff: the pull stays gentle until the pointer is close,
         then comes on quickly. A linear falloff makes every element on the
         page twitch whenever the pointer is anywhere near. */
      const f = 1 - d / cfg.reach;
      const g = f * f;
      it.tx = clamp(dx * cfg.pull * g, cfg.max);
      it.ty = clamp(dy * cfg.pull * g, cfg.max);
    }
  }

  function clamp(v, m) { return v > m ? m : v < -m ? -m : v; }

  function frame() {
    raf = 0;
    if (destroyed) return;
    let busy = false;

    for (const it of items) {
      it.vx = (it.vx + (it.tx - it.x) * cfg.stiffness) * cfg.damping;
      it.vy = (it.vy + (it.ty - it.y) * cfg.stiffness) * cfg.damping;
      it.x += it.vx; it.y += it.vy;

      it.vs = (it.vs + (it.ts - it.s) * cfg.stiffness) * cfg.damping;
      it.s += it.vs;

      const moving = Math.abs(it.vx) > 0.01 || Math.abs(it.vy) > 0.01
                  || Math.abs(it.tx - it.x) > 0.01 || Math.abs(it.ty - it.y) > 0.01
                  || Math.abs(it.vs) > 0.0002 || Math.abs(it.ts - it.s) > 0.0002;
      if (moving) busy = true;
      else if (it.x !== it.tx || it.s !== it.ts) {
        it.x = it.tx; it.y = it.ty; it.vx = it.vy = 0;
        it.s = it.ts; it.vs = 0;
      }

      /* The standalone `translate` property, not `transform`. A host that has
         its own transform on the button — a scale on hover, a rotation, a
         framework's animation — keeps it, because these compose instead of
         overwriting each other. Writing transform here is the usual way this
         effect quietly breaks someone's existing CSS. */
      write(it.el, it.x, it.y);
      /* `scale`, like `translate`, is a standalone property — so the press
         composes with a host transform rather than replacing it. */
      it.el.style.scale = Math.abs(it.s - 1) < 0.0005 ? '' : it.s.toFixed(4);
      if (it.inner) write(it.inner, it.x * cfg.innerPull, it.y * cfg.innerPull);
    }

    if (busy) raf = global.requestAnimationFrame(frame);
    else running = false;
  }

  function write(el, x, y) {
    el.style.translate = (x || y) ? `${x.toFixed(2)}px ${y.toFixed(2)}px` : '';
  }

  function kick() {
    if (destroyed || running || motionOff()) return;
    running = true;
    raf = global.requestAnimationFrame(frame);
  }

  /* One listener on the document, not one per element. Twelve nav links should
     cost one event handler, not twelve. */
  function onMove(e) {
    if (motionOff()) return;
    if (rectsStale) measure();
    aim(e.clientX, e.clientY);
    kick();
  }
  function onOut(e) {
    /* relatedTarget null means the pointer left the window entirely. */
    if (e.relatedTarget === null) { for (const it of items) { it.tx = 0; it.ty = 0; } kick(); }
  }

  /* Press, delegated like the move. pointerdown fires for a finger as well as
     a mouse, so this is the half of the effect a touch screen still gets.
     Release is listened for on the document, not the button, because a drag
     that ends outside it must still let go — otherwise the button stays sunk. */
  function onDown(e) {
    if (motionOff()) return;
    for (const it of items) {
      if (it.el !== e.target && !it.el.contains(e.target)) continue;
      if (cfg.press !== 1) it.ts = cfg.press;
      if (cfg.drag > 0) { it.held = true; it.ox = e.clientX; it.oy = e.clientY; }
      kick();
      break;
    }
  }
  function onUp() {
    let any = false;
    for (const it of items) {
      if (it.ts !== 1) { it.ts = 1; any = true; }
      if (it.held) { it.held = false; it.tx = 0; it.ty = 0; any = true; }
    }
    if (any) kick();
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });
  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerup', onUp, { passive: true });
  /* pointercancel is what makes the drag safe on a phone. When a touch that
     started on the button turns out to be the beginning of a scroll, the
     browser takes the gesture over and fires this — so the button lets go and
     springs back instead of travelling with a scroll it is not part of.
     Nothing here calls preventDefault or sets touch-action, so the page
     scrolls exactly as it would without the effect. */
  document.addEventListener('pointercancel', onUp, { passive: true });

  /* Anything that moves the page under the pointer invalidates the cache. The
     flag is cheap; the measuring happens on the next pointer move. */
  const stale = () => { rectsStale = true; };
  global.addEventListener('scroll', stale, { passive: true, capture: true });
  global.addEventListener('resize', stale, { passive: true });

  let ro = null;
  if (global.ResizeObserver) {
    ro = new ResizeObserver(stale);
    for (const it of items) ro.observe(it.el);
  }

  function rest() {
    for (const it of items) {
      it.x = it.y = it.vx = it.vy = it.tx = it.ty = 0;
      it.s = it.ts = 1; it.vs = 0;
      it.el.style.translate = it.hadTranslate;
      it.el.style.scale = it.hadScale;
      if (it.inner) it.inner.style.translate = it.hadInner;
    }
  }
  const onReduced = () => { if (motionOff()) { if (raf) { global.cancelAnimationFrame(raf); raf = 0; } running = false; rest(); } };
  if (reduced && reduced.addEventListener) reduced.addEventListener('change', onReduced);

  if (cfg.credit) console.log('Leaf Spring — a free unbland effect · https://unbland.dev');

  const api = {
    /* After the page reflows for a reason nothing here observes — a font
       landing, an accordion opening, a route change. */
    refresh() { rectsStale = true; },
    setConfig(next) { Object.assign(cfg, next || {}); rectsStale = true; kick(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (raf) { global.cancelAnimationFrame(raf); raf = 0; }
      running = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      global.removeEventListener('scroll', stale, { capture: true });
      global.removeEventListener('resize', stale);
      if (ro) ro.disconnect();
      if (reduced && reduced.removeEventListener) reduced.removeEventListener('change', onReduced);
      rest();
    },
    get elements() { return items.map((i) => i.el); },
  };
  return api;
}

global.UnblandLeafSpring = { create, DEFAULTS };

})(typeof window !== 'undefined' ? window : globalThis);
