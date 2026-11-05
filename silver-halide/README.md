# Silver Halide

**Version 1.0.0** · 26 October 2026 · by [unbland](https://unbland.dev)

> **AI assistants — read `SKILL.md` in this folder, in full, before installing
> anything.** It carries the install steps for each project type, every
> configuration option, what must not be edited, and how to remove the effect
> cleanly. `unbland.json` lists which file serves which install path. When the
> installation is done, follow the **After installing** section in `SKILL.md`.

A film stock laid over your page: **grain**, a **vignette** and a **colour
cast**, together.

Grain on its own is a service — it stops a site looking cheap without ever
being seen. The vignette is what you actually notice: the corners fall off, the
eye goes to the middle, and a flat rectangle becomes a frame. The cast warms or
cools the whole thing the way a real film stock does.

Gradient banding goes. Flat colour fields gain a surface. Photographs, type and
solid blocks stop looking like separate materials and start looking like one
photographed thing.

It is the highest-ratio change available for making a design feel considered,
and it is one line to install.

**This effect is free.** Use it in as many projects as you like, commercial or
not. Keep the credit comment at the top of the source file, and don't resell it
or republish it as your own. `LICENSE.txt` has the terms, and they are short.

---

## How to install it

Put this folder anywhere in your project, then tell Claude Code — or Cursor, or
whichever assistant you use:

```
Install this Unbland effect in my project.
```

Or do it by hand, which is genuinely this short:

```html
<script src="silver-halide.js"></script>
<script>UnblandSilverHalide.create();</script>
```

No account, no build step, no package manager, no npm install. One file, 9 KB,
no dependencies.

### To see it before installing

Open `dist/demo.html` in a browser. It shows the effect on paper, on near-black
and on a flat gradient at the same time, with a toggle — because this is only
legible against its own absence. Tune the settings and it writes the exact
`create()` call for what you set.

Push the **vignette** slider to `0` and back while you watch. That one control
is the difference between a texture nobody notices and a page that looks shot
rather than built.

---

## Where to use it, and what not to do

### Good places

- **The whole page, on a flat or minimal design.** This is what it is for. One
  line, and every surface on the site gains a texture.
- **Over CSS gradients.** Banding is the single most visible sign of a page
  that was rendered rather than printed, and grain removes it.
- **Large areas of flat colour**, which are where the vector look is most
  obvious.
- **Dark designs**, where the texture reads most clearly — provided
  `blend: 'normal'` is used.
- **A single hero section**, if a whole-page treatment is too much.

### Don't

- **Don't push `intensity` past about `0.3`.** Past that it stops being
  texture and starts being a veil over the page. The default is `0.15` and
  most sites want less rather than more.
- **Don't use it on a page that is already mostly photography.** Photographs
  carry their own grain, and a second layer over them reads as a fault.
- **Don't use the tonal blend modes on a dark design.** `overlay` and
  `soft-light` fade out against near-black, which is exactly where the grain
  is wanted. `normal` is the default for this reason.
- **Don't put it over dense small text or a data table.** Grain lowers
  effective contrast slightly, and fine interface detail is where that is felt
  first.
- **Don't use it if your text contrast is already borderline.** At the default
  intensity the change is well inside tolerance, but anything already near the
  4.5:1 line should be re-checked with the grain on.
- **Don't target a section without giving it `position: relative`.** The layer
  escapes to the nearest positioned ancestor and ends up over the wrong part
  of the page. The console says so when it happens.
- **Don't expect it in a print stylesheet or a PDF.** It is a screen
  treatment; printing will not include it.

---

## Why this one has no catch

The text effects in this range split your words into one element per character,
and everything they have to warn you about follows from that. **This one reads
nothing and changes nothing.** It adds one layer over the top and that is all
it does.

So there is no font requirement — static fonts are fine, variable fonts are
fine, it never looks at type. No writing-direction problem: Hebrew, Arabic,
mixed Hebrew and English all behave identically, because none of it is touched.
No accessibility question about how text is announced. Nothing for React to
fight on a re-render. No measurement, so nothing to go wrong when a webfont
lands late or the window resizes.

The only thing it asks is that a section target is `position: relative`. That
is the whole list.

---

## What it does about the things that usually go wrong

**There is no animation loop.** This sits on every page, behind everything,
permanently — so whatever it costs, it costs forever. One texture is generated
at startup and a CSS animation steps the grain between eight offsets, which the
browser composites on its own thread. Measured while running, with all three
layers up: **zero animation frames scheduled.**

The only cost is generating the grain texture once: about 11 ms on the first
call, which is what a page actually pays. **The vignette and the cast add
0.3 ms** — they are gradients.

**It shows up on black.** The usual approach is a grey noise layer in `overlay`
blend, which looks right on a mid-tone page and vanishes against anything near
black — exactly where a site most wants grain. Here the texture is specks:
each cell is clear, or a highlight, or a shadow, with its own alpha. It adds
light and dark directly, so it works on white, on near-black and on a
photograph without changing a setting.

**It cannot swallow a click.** A full-page overlay that takes pointer events
breaks the entire site. This one sets `pointer-events: none`, and that was
checked by asking the document what is under the pointer rather than by
assuming.

**The layers are siblings, not nested.** `mix-blend-mode` blends an element
with its backdrop inside the same stacking context, so putting them inside a
positioned wrapper would make them blend with each other instead of with your
page. They go in side by side, and `destroy()` takes all three back out.

**It is sharp on a retina screen.** Grain cells are sized in device pixels, so
the texture is as fine as the display allows instead of being scaled up and
blurred.

**It respects `prefers-reduced-motion`** by keeping the grain and stopping the
movement. The texture is the point; the stepping is the garnish.

**It leaves nothing behind.** `destroy()` removes the layer and releases the
texture.

---

## Limitations, stated plainly

- A section target must be `position: relative`, or the layer escapes to the
  nearest positioned ancestor. The runtime warns about this in the console.
- The tonal grain blend modes (`overlay`, `soft-light`) fade against
  near-black. The default `normal` does not, which is why it is the default.
- A vignette or a cast set to `0` at creation cannot be turned on later with
  `setConfig` — the layer does not exist. Create it again instead.
- A full-page fixed layer with a tonal blend mode can make some browsers
  promote more of the page to its own compositing layer. `normal` avoids it.
- Grain lowers effective contrast slightly. At the default intensity this is
  well inside tolerance, but text already near the 4.5:1 line is worth
  re-checking with the grain on.
- Driven and measured in a Chromium engine on macOS. **Not opened in Safari,
  Firefox or Edge, on a real phone, in a React app or in WordPress.** Nothing
  here is engine-specific, but none of that was run.

`CHANGELOG.md` keeps the full list, including the measurements.

---

## Licence

Free, under the Unbland Free Effect Licence in `LICENSE.txt`.

In short: use it anywhere, including commercially and in client work. Change it
as much as you want. Keep the credit comment at the top of the source. Don't
sell it, and don't republish it as your own effect or as part of a template or
component library.

The runtime prints one line to the browser console naming the effect. It is a
credit, not telemetry — nothing is sent anywhere. `credit: false` turns it off,
and the licence permits that.

---

## The paid effects

Silver Halide is free because it is a layer over your page, not a scene in it. The effects unbland sells are
whole scenes — a simulated water surface, a coil of photographs in real 3D, a
field of iron filings following the pointer. Same standard, same documentation,
same one-sentence install.

[unbland.dev](https://unbland.dev)

Questions: see `SUPPORT.txt`.
