/*!
 * Silver Halide — runtime  ·  v1.0.0
 * unbland — https://unbland.dev
 *
 * Free to use in any project, commercial or personal, under the Unbland Free
 * Effect Licence. See LICENSE.txt. Keep this comment. Do not resell it or
 * republish it as your own effect.
 *
 * A film stock laid over the page: grain, a vignette and a colour cast. One
 * noise texture is generated at startup and stepped by a CSS animation; the
 * other two layers are gradients. After the first frame there is no
 * JavaScript running at all.
 *
 * Grain on its own is a service — it stops a page looking cheap without ever
 * being seen. The vignette is what makes it land: it darkens the edges, pulls
 * the eye to the middle, and turns a flat page into a frame. The three
 * together read as photography; grain alone reads as nothing.
 *
 * Usage:
 *   <script src="silver-halide.js"></script>
 *   <script>UnblandSilverHalide.create();</script>        // the whole page
 *   <script>UnblandSilverHalide.create('#hero');</script> // one section
 *
 * It reads nothing and changes nothing on the page. No text is touched, no
 * element is measured, and it has no opinion about fonts, language or
 * direction — which is why it has none of the limitations a text effect has.
 */
(function (global) {
'use strict';

const DEFAULTS = {
  /* grain */
  intensity: 0.15,     // 0–1. Above about 0.3 it stops being texture
  size:      1,        // device pixels per grain cell. 1 is finest
  fps:       12,       // film is 24; grain itself reads at about half that
  blend:     'normal', // 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen'
  tint:      '',       // '' is monochrome; any CSS colour tints the specks
  tile:      200,      // CSS px of texture before it repeats

  /* the frame */
  vignette:  0.38,     // 0–1 darkness at the corners. 0 removes the layer
  falloff:   58,       // % of the way out before it starts darkening
  /* the stock */
  cast:      '#ffb46b',// a CSS colour warming the whole frame; '' removes it
  castAmount: 0.06,    // 0–1. This is a cast, not a filter — keep it low
  fixed:     null,     // null = decide from the target; true pins it to the viewport
  /* Above everything, so the texture unifies the whole page rather than
     stopping under a sticky header. Safe at this height only because the
     layer takes no pointer events — it covers the page and blocks nothing. */
  zIndex:    2147483647,
  credit:    true,
};

/* ── WHY THERE IS NO ANIMATION LOOP ────────────────────────────────────
   Grain is the one effect that sits on every page, behind everything, all the
   time. Anything it costs, it costs permanently — so a requestAnimationFrame
   loop redrawing noise is the wrong shape no matter how cheap each frame is.

   Instead one noise tile is generated at startup and the layer is moved
   between eight uncorrelated offsets by a CSS steps() animation. The browser
   composites that on its own thread; the main thread does nothing after the
   first frame. Stepping the position of a repeating tile by large, mutually
   prime offsets is what makes consecutive frames look like different grain
   rather than the same grain sliding. */

const STEPS = [
  [0, 0], [-37, 23], [19, -41], [-53, -11],
  [41, 37], [-13, -47], [29, 17], [-43, 43],
];

let seq = 0;

function warn(msg) { console.warn('[Silver Halide] ' + msg); }

/* Specks, not a grey wash. Each cell is either clear or a light or dark speck
   with its own alpha, so the texture adds highlights and shadows directly and
   therefore shows up on white, on black and on a photograph alike. A mid-grey
   noise layer in `overlay` is the usual approach and it disappears on anything
   near black, which is exactly where a site most wants grain. */
function makeTile(px, cell, tint) {
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const ctx = c.getContext('2d', { alpha: true });
  if (!ctx) return null;

  const img = ctx.createImageData(px, px);
  const d = img.data;

  let rgb = [255, 255, 255];
  if (tint) {
    const probe = document.createElement('canvas').getContext('2d');
    probe.fillStyle = tint;
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(probe.fillStyle);
    if (m) rgb = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }

  for (let y = 0; y < px; y += cell) {
    for (let x = 0; x < px; x += cell) {
      const r = Math.random();
      /* Roughly a third of cells carry anything. A fully populated field is
         television static; film grain is sparse, which is what lets it sit at
         a readable opacity without veiling the page. */
      let v = 0, a = 0;
      if (r < 0.17)      { v = 1; a = Math.random() * 0.9; }        // highlight
      else if (r < 0.34) { v = 0; a = Math.random() * 0.9; }        // shadow
      const R = v ? rgb[0] : 0, G = v ? rgb[1] : 0, B = v ? rgb[2] : 0;
      const A = (a * 255) | 0;

      for (let dy = 0; dy < cell && y + dy < px; dy++) {
        for (let dx = 0; dx < cell && x + dx < px; dx++) {
          const i = ((y + dy) * px + (x + dx)) * 4;
          d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = A;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function create(target, options) {
  const cfg = Object.assign({}, DEFAULTS, options || {});

  /* No target means the whole page, which is what this effect is usually for. */
  let host = null, toViewport = false;
  if (target == null || target === document || target === document.body) {
    toViewport = true;
  } else {
    host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) { warn(`no element matches ${target}`); return null; }
  }
  if (cfg.fixed !== null) toViewport = !!cfg.fixed;

  const doc = host ? host.ownerDocument : document;
  const dpr = Math.min(3, global.devicePixelRatio || 1);
  const cell = Math.max(1, Math.round(cfg.size));
  const tilePx = Math.max(32, Math.round(cfg.tile * dpr));

  const canvas = makeTile(tilePx, cell, cfg.tint);
  if (!canvas) { warn('no 2d canvas context; nothing to draw with'); return null; }

  /* ── THREE SIBLINGS, NOT A CONTAINER ──────────────────────────────────
     mix-blend-mode blends an element with its backdrop inside the same
     stacking context. A wrapper with a z-index makes one, so layers nested in
     it would blend with each other instead of with the page. They go in as
     siblings, and destroy() takes them all back out. */
  const layers = [];
  const position = toViewport ? 'fixed' : 'absolute';
  /* contain:strict keeps a layer out of the page's layout and paint
     bookkeeping; without it a full-page fixed layer makes the browser
     reconsider more than it needs to on every scroll. */
  const shared = `position:${position};inset:0;pointer-events:none;contain:strict;`;

  function addLayer(cls, css) {
    const el = doc.createElement('div');
    el.className = cls;
    /* A layer over the page must never take a click, a hover or a tap. That
       is in `shared`, and it is the difference between a decoration and a
       broken site. */
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = shared + css;
    layers.push(el);
    return el;
  }

  /* 1. The cast. A whole-frame colour, the way a film stock is warm or cool.
        It sits underneath so the grain and the vignette read on top of it. */
  let castEl = null;
  if (cfg.cast && cfg.castAmount > 0) {
    castEl = addLayer('sh-cast',
      `background:${cfg.cast};opacity:${cfg.castAmount};` +
      `mix-blend-mode:soft-light;z-index:${cfg.zIndex};`);
  }

  /* 2. The vignette. This is the layer that makes the effect visible at all:
        grain alone is a texture nobody notices, and darkened corners are what
        turn a flat page into a frame. A radial gradient, so it costs nothing
        and never animates. */
  let vigEl = null;
  if (cfg.vignette > 0) {
    vigEl = addLayer('sh-vignette',
      `background:radial-gradient(ellipse at center,` +
      ` rgba(0,0,0,0) ${cfg.falloff}%, rgba(0,0,0,${cfg.vignette}) 130%);` +
      `z-index:${cfg.zIndex};`);
  }

  /* 3. The grain, on top. */
  const layer = addLayer('sh-layer',
    `background-repeat:repeat;background-size:${cfg.tile}px ${cfg.tile}px;` +
    `opacity:${cfg.intensity};mix-blend-mode:${cfg.blend};` +
    `z-index:${cfg.zIndex};will-change:background-position`);

  let url = '';
  let destroyed = false;
  const attach = (href) => { url = href; layer.style.backgroundImage = `url("${href}")`; };

  /* toBlob keeps the texture out of the DOM as a string. The same PNG as a
     data URI is base64, a third larger again, and sits in the style attribute
     where every devtools inspection has to render it. */
  if (canvas.toBlob) canvas.toBlob((b) => { if (b && !destroyed) attach(URL.createObjectURL(b)); }, 'image/png');
  else attach(canvas.toDataURL('image/png'));

  /* The step animation, written once per document. */
  const styleId = 'sh-style';
  if (!doc.getElementById(styleId)) {
    const frames = STEPS.map((st_, i) =>
      `${(i / STEPS.length * 100).toFixed(2)}%{background-position:${st_[0]}px ${st_[1]}px}`).join('');
    const st = doc.createElement('style');
    st.id = styleId;
    st.textContent =
      `@keyframes sh-grain{${frames}100%{background-position:${STEPS[0][0]}px ${STEPS[0][1]}px}}` +
      /* The texture is the point; the movement is a garnish. Reduced motion
         keeps the grain, the vignette and the cast, and stops the stepping. */
      `@media (prefers-reduced-motion:reduce){.sh-layer{animation:none!important}}`;
    doc.head.appendChild(st);
  }
  if (cfg.fps > 0) {
    layer.style.animation = `sh-grain ${(STEPS.length / cfg.fps).toFixed(3)}s steps(1) infinite`;
  }

  const parent = toViewport ? doc.body : host;
  if (!toViewport) {
    /* An absolutely positioned layer in a static parent escapes to whatever
       ancestor is positioned, and the frame ends up over the wrong section. */
    const pos = global.getComputedStyle(host).position;
    if (pos === 'static') warn(`${target} is position:static — give it position:relative, or the effect will not stay inside it`);
  }
  for (const el of layers) parent.appendChild(el);

  if (cfg.credit) console.log('Silver Halide — a free unbland effect · https://unbland.dev');

  const api = {
    /* Changing the look without regenerating the texture, which is the
       expensive part — a theme switch or a builder slider goes through here. */
    setConfig(next) {
      const n = next || {};
      Object.assign(cfg, n);
      if ('intensity' in n) layer.style.opacity = cfg.intensity;
      if ('blend' in n) layer.style.mixBlendMode = cfg.blend;
      if ('tile' in n) layer.style.backgroundSize = `${cfg.tile}px ${cfg.tile}px`;
      if ('fps' in n) {
        layer.style.animation = cfg.fps > 0
          ? `sh-grain ${(STEPS.length / cfg.fps).toFixed(3)}s steps(1) infinite` : 'none';
      }
      /* The vignette and the cast are gradients, so they retune for free —
         but a layer that was not created cannot be turned on later. Going
         from 0 to something needs a new create(). */
      if (vigEl && ('vignette' in n || 'falloff' in n)) {
        vigEl.style.background =
          `radial-gradient(ellipse at center, rgba(0,0,0,0) ${cfg.falloff}%,` +
          ` rgba(0,0,0,${cfg.vignette}) 130%)`;
      }
      if (castEl && 'castAmount' in n) castEl.style.opacity = cfg.castAmount;
      if (castEl && 'cast' in n) castEl.style.background = cfg.cast;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const el of layers) el.remove();
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    },
    get element() { return layer; },
    get elements() { return layers.slice(); },
  };
  return api;
}

global.UnblandSilverHalide = { create, DEFAULTS };

})(typeof window !== 'undefined' ? window : globalThis);
