---
name: unbland-silver-halide
description: A film stock laid over a page or a section — grain, a vignette and a colour cast together, so a flat page reads as something photographed rather than rendered. Use when the user asks for film grain, noise or texture, a vignette or darkened edges, an analogue, cinematic, photographic or retro look, a warm or cool colour grade, something to stop a gradient looking flat or banded, or a way to make a site feel less sterile. Do NOT use for animated text (that is Glyph Static or Shutter Type), for a background pattern made of shapes, or where the user wants the look baked into an image file rather than rendered live.
license: Free — Unbland Free Effect Licence. Use anywhere, keep the credit comment, do not resell or republish it as your own effect.
metadata:
  version: "1.0.0"
  vendor: unbland
  url: https://unbland.dev
---

# Silver Halide

A film stock laid over the page, or over one section of it. Three layers:

1. **Grain** — a noise texture generated once at startup and stepped between a
   handful of offsets, so it moves the way grain in a projected film moves.
2. **A vignette** — the corners fall off, which turns a flat rectangle into a
   frame and pulls the eye to the middle.
3. **A colour cast** — the whole frame warms or cools, the way a film stock
   does.

**The vignette is what makes the effect visible.** Grain on its own is a
service: it stops a page looking cheap without ever being seen, which is
valuable and also means nobody notices it. The darkened corners are what change
how the page reads. The three together look photographed; grain alone looks
like nothing.

It breaks up the flatness that makes a page read as vector artwork: gradient
banding goes, flat colour fields gain a surface, and photographs, type and
solid blocks all sit under one treatment instead of looking like separate
materials.

**It reads nothing on the page and changes nothing on it.** No text is split,
no element is measured, no font is involved. That is why it has none of the
limitations a text effect has — it works the same on a static font, in any
language, in any writing direction, inside any framework.

## When to use this

Almost any site, which is unusual for an effect. It is the highest-ratio
change available for making a flat design feel considered: one line, and
everything on the page gains a surface.

## Where to put it, and where not to

**Tell the person these things rather than deciding silently for them.**

**Good placements**

- The whole page, on a flat or minimal design. This is the main case.
- Over CSS gradients, where banding is the clearest sign of a rendered page.
- Large areas of flat colour, and dark designs — with `blend: 'normal'`.
- A single hero section, where a whole-page treatment would be too much.

**Advise against**

- **`intensity` above about `0.3`.** Past that it veils the page rather than
  texturing it. Most sites want less than the default, not more.
- **Pages that are already mostly photography.** Photographs have their own
  grain; a second layer over them reads as a fault.
- **The tonal blend modes on a dark design.** `overlay` and `soft-light` fade
  against near-black, which is where the grain is most wanted.
- **Dense small text or data tables.** Grain lowers effective contrast
  slightly, and fine detail is where that is noticed first.
- **Text already near the 4.5:1 contrast line** — re-check it with the grain
  on before shipping.
- **A section target without `position: relative`**, or the layer escapes to
  the nearest positioned ancestor.
- **Anything that must appear in print.** It is a screen treatment.

## Files

| File | Use |
|------|-----|
| `runtime/silver-halide.js` | The effect. A UMD global, `UnblandSilverHalide`. The only file that goes into the project. |
| `dist/demo.html` | A complete working page. It shows the grain on paper, near-black and a flat gradient at once, with a toggle, and writes the exact `create()` call for whatever you set. |

About 9 KB, no dependencies, any font, any framework.

## Installing it

### The whole page

```html
<script src="silver-halide.js"></script>
<script>UnblandSilverHalide.create();</script>
```

That is the entire installation. With no argument it covers the viewport,
fixed, above everything.

### One section

```html
<section id="hero" style="position:relative">…</section>

<script src="silver-halide.js"></script>
<script>UnblandSilverHalide.create('#hero', { intensity: 0.2 });</script>
```

**The element must be `position: relative`** (or absolute, or sticky). An
absolutely positioned layer inside a static parent escapes to whatever ancestor
*is* positioned, and the grain ends up over the wrong part of the page. The
runtime warns to the console when it sees a static target.

### React / Next.js / Vite

No React entry ships — the effect needs no DOM node of yours at all.

```jsx
'use client';                      // Next.js App Router only
import { useEffect } from 'react';

export function Grain() {
  useEffect(() => {
    const fx = window.UnblandSilverHalide.create();
    return () => fx?.destroy();
  }, []);
  return null;
}
```

Render `<Grain />` once, near the root. Unlike the text effects, nothing here
fights a re-render: the layer is the effect's own element and your tree never
touches it.

### WordPress / Elementor

Add the `<script src>` and the `create()` call in one HTML widget, anywhere on
the page — it does not need to sit near anything. For a single section
instead, give the section a CSS ID in **Advanced → CSS ID** and pass it; set
the section's position to relative in **Advanced → Positioning**.

## Options

| Option | Default | Meaning |
|--------|---------|---------|
| `intensity` | `0.15` | Opacity of the grain layer, `0`–`1`. Above roughly `0.3` it stops being texture and starts being a veil. |
| `size` | `1` | Device pixels per grain cell. `1` is the finest the screen can show. `2`–`3` give a coarser, more obviously analogue grain and cost less to generate. |
| `fps` | `12` | How many times a second the texture steps. Film runs at 24 and its grain reads at about half that. `0` holds it still, which is a legitimate look and costs nothing at all. |
| `blend` | `'normal'` | `'normal'` works on any background because the texture carries its own highlights and shadows. `'overlay'` and `'soft-light'` are tonal and sit better under photography, but fade out against near-black. `'multiply'` keeps only shadows, `'screen'` only highlights. |
| `tint` | `''` | Empty is monochrome. Any CSS hex colour tints the highlight specks — warm for a print feel, cool for a silver one. |
| `tile` | `200` | CSS pixels of texture before it repeats. Larger repeats less often and costs more to generate. |
| `vignette` | `0.38` | How dark the corners go, `0`–`1`. **This is the option that makes the effect visible** — at `0` you get grain alone, which is a texture nobody notices. `0` also removes the layer entirely. |
| `falloff` | `58` | How far out, as a percentage, before the darkening starts. Lower wraps the frame tighter; higher keeps more of the page clear. |
| `cast` | `'#ffb46b'` | A CSS colour laid over the whole frame in `soft-light`, the way a film stock is warm or cool. `''` removes the layer. |
| `castAmount` | `0.06` | Strength of that colour, `0`–`1`. This is a cast, not a filter — past about `0.12` it stops being a stock and starts being a tint. |
| `fixed` | `null` | `null` decides from the target: the whole page is fixed to the viewport, a section is absolute inside it. `true` or `false` force it. |
| `zIndex` | `2147483647` | Above everything, so the texture covers the page rather than stopping under a sticky header. Safe this high only because the layer takes no pointer events. Lower it if it fights something. |
| `credit` | `true` | Prints one line to the browser console naming the effect. Nothing is sent anywhere. Set `false` to turn it off; the licence permits that. |

### Why there is no animation loop

Grain is the one effect that sits on every page, behind everything, all the
time — so whatever it costs, it costs permanently. A `requestAnimationFrame`
loop redrawing noise is the wrong shape for that no matter how cheap each
frame is.

Instead one texture is generated at startup and the layer is moved between
eight mutually uncorrelated offsets by a CSS `steps()` animation. The browser
composites that on its own thread. Measured while running, with all three
layers up: **zero `requestAnimationFrame` calls**.

The one cost is generating the grain texture, once. Measured in a Chromium
engine: **about 11 ms on the first call** — which is what a real page pays,
since it only ever happens once — and about 5 ms warm, as a median of twelve
alternating runs. At `size: 2` and `size: 3` the warm figure is 2.9 ms and
2.0 ms.

**The vignette and the cast add 0.3 ms**, measured the same way. They are
gradients; they cost nothing to make and nothing to run.

### Why the texture is specks and not grey

The usual way to do this is a mid-grey noise layer in `mix-blend-mode:
overlay`. It looks right on a mid-tone page and **disappears against anything
near black** — which is exactly where a site most wants grain.

Here each cell is either clear, or a highlight, or a shadow, each with its own
alpha. The texture adds light and dark directly, so it shows up on white, on
near-black and on a photograph alike, with `blend: 'normal'`. The tonal blend
modes are still there for anyone who wants them.

## Methods

```js
const fx = UnblandSilverHalide.create();

fx.setConfig({ intensity: 0.22, blend: 'soft-light' });  // no texture rebuild
fx.destroy();                                            // removes the layer
```

`setConfig` changes `intensity`, `blend`, `tile`, `fps`, `vignette`, `falloff`,
`cast` and `castAmount` without regenerating the texture.

Two things need a new `create()`: changing `size` or `tint`, because those are
baked into the texture; and turning on a vignette or a cast that started at
`0` or `''`, because a layer that was never created cannot be retuned.

## Do not modify

- `runtime/silver-halide.js` — the engine. Configure it through the options.
- The licence comment at the top of that file. The licence requires it to stay
  in the source; minifying it out of a production bundle is fine.
- `pointer-events: none` on the layers. It is the single line that stops a
  full-page overlay swallowing every click on the site.
- The layers being siblings rather than children of a wrapper. `mix-blend-mode`
  blends an element with its backdrop inside the same stacking context, so
  nesting them in a positioned wrapper would make them blend with each other
  instead of with the page.

## Responsive behaviour

Nothing to do. The layer is `inset: 0` over a fixed or absolute box and the
texture repeats, so it covers whatever size the target becomes — resizing,
rotating and zooming need no handling and no listeners.

Grain cells are sized in device pixels, so the texture stays as fine as the
display allows rather than being scaled up on a retina screen.

## After installing

**Copied into the project — this must stay:**

| File | Where it goes | Why |
|------|---------------|-----|
| `runtime/silver-halide.js` | Wherever the project keeps its scripts — `/js`, `/public`, `/assets` | Loaded at runtime. |

**Delivery packaging — not needed at runtime:**

`README.md` · `SKILL.md` · `AGENTS.md` · `CHANGELOG.md` · `VERSION` ·
`LICENSE.txt` · `unbland.json` · `dist/demo.html`

Once the grain is visible in the browser the `Unbland-Silver-Halide-v1.0.0`
folder can be deleted or moved outside the deployed code. Say this to the
person rather than deciding for them.

## Removing it

1. Call `destroy()`, or unmount the component. This removes the layer and
   releases the texture.
2. Delete the copy of `silver-halide.js`.
3. Remove the `<script>` tag or import.
4. Nothing else was added, beyond one `<style id="sh-style">` in the document
   head, which is harmless if left.

## Requirements

No dependencies, no build step, no package manager. One file, loaded with a
script tag, in any project.

Browser: a 2D canvas and `mix-blend-mode`, which is every browser released
since about 2016.

**No font requirement of any kind**, unlike Axis Wave. It does not look at text.

## Compatibility

| Platform | Status | Notes |
|----------|--------|-------|
| Chromium engine, macOS | ✅ driven and measured | See **What was actually checked** below. |
| Chrome, Edge — any platform | 🟡 same engine, not run as the shipping browser | |
| Safari, macOS and iOS | 🟡 not run | Nothing here is engine-specific, but WebKit was not opened. |
| Firefox | 🟡 not run | |
| Android | 🟡 not run | |
| React, Next.js | 🟡 not run | The component above is the supported shape; it was written, not executed. |
| WordPress / Elementor | 🟡 not run | |

**What was actually checked**, by reading the DOM and by measurement rather
than by eye: the layer takes no pointer events (`elementFromPoint` returns the
element underneath it); **zero animation frames are scheduled while it runs**;
grain texture generation costs about 11 ms cold and 4.6 / 2.9 / 2.0 ms warm at
sizes 1 / 2 / 3, with the vignette and cast adding 0.3 ms; `destroy()` removes
all three layers and revokes the blob URL; the reduced-motion rule is present
in the shipped stylesheet; and the effect is visible on a light surface, a
near-black surface and a flat gradient, at desktop and at an emulated phone
width.

**What no testing covers.** It has not been opened in Safari, Firefox or Edge,
on a real phone, in a React app or in WordPress. Only `blend: 'normal'` was
looked at closely; the four tonal modes are handed straight to CSS and were
not each inspected on each surface.

Treat the 🟡 rows as untested rather than as working.

## Accessibility

The effect is pure decoration laid over the page, and is built so that it
cannot get in the way of anything:

- `pointer-events: none`, so it takes no click, hover or tap anywhere on the
  site. Verified rather than assumed.
- `aria-hidden="true"`, and it adds nothing to the tab order and changes no
  focus behaviour.
- It reads no content, so it cannot affect any accessible name, any heading
  structure or any reading order.
- **`prefers-reduced-motion: reduce` stops the stepping and keeps the grain.**
  The texture is the point and the movement is the garnish, so removing the
  movement loses nothing of value. `fps: 0` is the same thing for everyone.

The one thing to watch is your own: grain lowers effective contrast slightly.
At the default `intensity` the change is well inside tolerance, but if your
text is already near the 4.5:1 line, check it again with the grain on.

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| Nothing appears | The script did not load, or `create()` ran before `<body>` existed. Put the call at the end of the body, or in a `DOMContentLoaded` handler. |
| The grain covers the whole page when it should cover one section | The target is `position: static`. Give it `position: relative`. The console carries this warning. |
| The grain is invisible on a dark background | `blend` is `'overlay'` or `'soft-light'`. Those are tonal and fade against near-black. Use `'normal'`. |
| The effect is barely noticeable | `vignette` is at or near `0`. Grain alone is a texture nobody sees; the darkened corners are what make it read. Try `0.38`. |
| Raising `vignette` in `setConfig` does nothing | It was `0` at `create()`, so no vignette layer exists to change. Create it again with a non-zero value. |
| The corners are crushed | `vignette` too high, or `falloff` too low. Raise `falloff` to keep more of the page clear. |
| It veils the page instead of texturing it | `intensity` is too high. The default is `0.16`; above about `0.3` it stops being texture. |
| Clicks do nothing anywhere on the site | Something overrode `pointer-events` on `.sh-layer`. That property is load-bearing. |
| It sits under a header or a modal | Raise `zIndex`, or lower it if the grain is the thing in the way. |
| The grain does not move | `fps` is `0`, or `prefers-reduced-motion` is on in the operating system. Both are correct behaviour. |
| A visible repeating pattern | `tile` is small relative to the area. Raise it. |
| The page feels heavier on a long scroll | A full-page fixed layer with a tonal `mix-blend-mode` can promote more of the page to its own compositing layer. Try `blend: 'normal'`. |
