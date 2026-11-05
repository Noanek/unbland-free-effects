# Changelog

All notable changes to Shutter Type. This project follows
[Semantic Versioning](https://semver.org).

## [1.0.0] — 2026-10-26

First release. Free under the Unbland Free Effect Licence.

### The effect

- Each character is clipped to its own box and slides out from under that
  edge. The shutter is the clipping edge itself — nothing is drawn over the
  text, and the effect has no overlay, bar or wipe layer of any kind.
- The stagger follows each character's position across the block rather than
  its index in the string, so a heading that wraps is revealed by one front
  crossing it instead of the reveal jumping back to the left on each new line.
- The timing is normalised between the first and last character rather than
  across the element's box, so a centred or wrapped heading does not keep
  running after the text has all arrived.
- `from` chooses whether letters arrive from below, from above, or fade in
  place for text whose position must not move at all.
- Right-to-left text is uncovered from the right. `sweep: 'auto'` reads the
  element's own `direction`, so a Hebrew or Arabic page is correct by default.
- Clipping is opened above and below with padding and taken back with an equal
  negative margin, so descenders are not cut off and the layout box is exactly
  what it would have been.

### Delivery formats

- Plain HTML / any framework — `runtime/shutter-type.js`, a UMD global, no
  build step and no dependencies.
- `dist/demo.html` — a working page that doubles as the place to tune the
  settings and copy the call. It carries a Hebrew specimen.

### Known limitations

- **Splitting text into characters breaks bidirectional reordering.** A line
  that mixes right-to-left text with Latin or digits may lay out in the wrong
  order. Hebrew on its own is correct — that was driven and checked; Arabic was
  not run — but
  mixed content is not.
- A resize part-way through a run keeps the positions measured before it, so
  the rest of that pass is staggered to the old layout. The finished text is
  correct and the next run re-measures. Resizing mid-animation is not a case
  worth the complexity of handling properly.
- With `trigger: 'view'` the text is hidden until it scrolls into sight. If an
  element is never scrolled to, it is never revealed.
- The character boxes use `overflow: hidden`. Text with an unusually large
  negative `letter-spacing`, or a font with very long swashes, can be clipped
  at the sides. Increase the padding in the stylesheet if that happens, or use
  `from: 'behind'`, which does not move the glyph at all.
- Built for headings. A page of body copy was never a design target.
- **Testing covers one engine.** Driven in a Chromium engine on macOS with
  every state inspected in the DOM. Not opened in Safari, Firefox, Edge, on
  any phone, in React or in WordPress. Frame-rate behaviour was never
  observed and performance was never measured.
- Hebrew, `dir="rtl"`, was among the states driven. Arabic was not.
