# Changelog

All notable changes to Glyph Static. This project follows
[Semantic Versioning](https://semver.org).

## [1.0.0] — 2026-10-26

First release. Free under the Unbland Free Effect Licence.

### The effect

- Text resolves out of noise. Each character cycles through substitute glyphs
  for `settle` milliseconds and then locks, with the starts staggered across
  the line so a settling front runs through it.
- Substitutes are cast by width. Each character gets a shortlist of the pool
  glyphs closest to it in the host's real font, so a stand-in always fits the
  box it is dropped into and the scrambling text never collides or shivers.
- Glyphs swap on their own clock, around 22 a second rather than at the frame
  rate, which is what makes it read as static resolving instead of a blur.
- `accent` colours a character while it is still unsettled, so the front is
  visible as it travels.
- Triggers on scroll into view, on hover, on load, or only when asked.

### Delivery formats

- Plain HTML / any framework — `runtime/glyph-static.js`, a UMD global, no
  build step and no dependencies.
- `dist/demo.html` — a working page that doubles as the place to tune the
  settings and copy the call.

### Known limitations

- **Splitting text into characters breaks bidirectional reordering.** A line
  that mixes right-to-left text with Latin or digits may lay out in the wrong
  order. Hebrew or Arabic on its own is fine; mixed content is not.
- The default glyph pool is Latin and digits. Scrambling non-Latin text with
  it will substitute Latin letters, which looks wrong — pass a `glyphs` pool
  from the same script as the text.
- With `trigger: 'view'` the text is blanked until it scrolls into sight. If
  the element is never scrolled to, it is never revealed. That is only a
  problem where an element is permanently out of view, in which case it was
  never read anyway.
- Built for headings. A page of body copy was never a design target, and
  blanking body copy until it scrolls into view would be a bad idea regardless.
- **Testing covers one engine.** Driven in a Chromium engine on macOS with
  every state inspected in the DOM. Not opened in Safari, Firefox, Edge, on
  any phone, in React or in WordPress. Frame-rate behaviour was never
  observed and performance was never measured.
