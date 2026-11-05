# Changelog

All notable changes to Silver Halide. This project follows
[Semantic Versioning](https://semver.org).

## [1.0.0] — 2026-10-26

First release. Free under the Unbland Free Effect Licence.

### The effect

- A film stock over the whole page, or over one section: grain, a vignette and
  a colour cast, as three sibling layers.
- **The vignette is what makes it visible.** Grain alone is a texture nobody
  notices; darkened corners are what turn a flat rectangle into a frame. It is
  on by default at `0.38` for that reason.
- The layers are siblings rather than nested, because `mix-blend-mode` blends
  within a stacking context — a positioned wrapper would make them blend with
  each other instead of with the page.
- **No animation loop.** One noise tile is generated at startup and the layer
  is stepped between eight uncorrelated offsets by a CSS `steps()` animation,
  so the browser composites the movement and the main thread does nothing
  after the first frame. Measured at zero `requestAnimationFrame` calls while
  running.
- The texture is specks rather than a grey wash — each cell is clear, or a
  highlight, or a shadow, with its own alpha. That is why it shows up on white,
  on near-black and on a photograph alike, where a mid-grey layer in `overlay`
  disappears against anything dark.
- Grain cells are sized in device pixels, so the texture is as fine on a
  retina screen as the screen allows rather than being blurred up.
- Takes no pointer events, carries `aria-hidden`, and reads nothing on the
  page. No text is touched, no element is measured, and it has no opinion
  about fonts, language or writing direction.
- `prefers-reduced-motion` keeps the grain and stops it stepping. The texture
  is the point; the movement is the garnish.

### Delivery formats

- Plain HTML / any framework — `runtime/silver-halide.js`, a UMD global, no
  build step and no dependencies.
- `dist/demo.html` — a working page that doubles as the place to tune the
  settings and copy the call. It shows the grain on paper, on near-black and
  on a flat gradient at once, with a toggle.

### What it costs

- Generating the grain texture, once, in a Chromium engine: about **11 ms on
  the first call** — what a real page pays — and 4.6 / 2.9 / 2.0 ms warm at
  sizes 1 / 2 / 3, as a median of twelve alternating runs.
- **The vignette and the cast add 0.3 ms**, measured the same way.
- After that, nothing on the main thread: zero `requestAnimationFrame` calls
  while running, with all three layers up.
- One PNG held as a blob, 200×200 CSS pixels by default at device resolution.

### Known limitations

- `mix-blend-mode` on a full-page fixed layer makes some browsers promote more
  of the page to its own compositing layer. The default `blend: 'normal'`
  avoids this; the tonal blend modes are worth checking on a heavy page.
- Very large `tile` values make a bigger texture to generate and hold. Past
  about 400 px the cost grows faster than the benefit.
- An element target must be `position: relative` or the layers escape to the
  nearest positioned ancestor. The runtime warns when it sees this.
- A vignette or cast set to `0` at creation has no layer, so `setConfig`
  cannot turn it on later. Create it again instead.
- Only `blend: 'normal'` was looked at closely. The other four are passed
  straight to CSS and were not each inspected on each surface.

### Testing

- Driven in a Chromium engine on macOS. Verified by reading the DOM and by
  measurement, not by eye: the layer takes no pointer events (`elementFromPoint`
  returns what is underneath), zero animation frames are scheduled while it
  runs, `destroy()` removes the layer and revokes the blob URL, the
  reduced-motion rule ships, and the effect is visible on all three test
  surfaces at an emulated phone width as well as at desktop width.
- **Not opened in Safari, Firefox or Edge, on a real phone, in a React app or
  in WordPress.** Nothing here is engine-specific, but none of that was run.
