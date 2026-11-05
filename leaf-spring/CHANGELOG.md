# Changelog

All notable changes to Leaf Spring. This project follows
[Semantic Versioning](https://semver.org).

## [1.0.0] — 2026-10-26

First release. Free under the Unbland Free Effect Licence.

### The effect

- A button leans toward the pointer as it comes near, and **overshoots and
  settles** when it leaves rather than sliding back. Damping below 1 is what
  gives it mass; measured on release at the defaults: −5.5 px, +1.09, −0.05,
  +0.01, still.
- **It sinks when pressed** and pops past its own size on release — a second
  spring on the scale axis, integrated beside the first. Measured: held at
  0.94, past 1.014 on release. Release is listened for on the document, so a
  drag that ends off the button still lets go.
- **It follows a held finger against resistance**, through `tanh` rather than
  a clamp: 40 px of finger travel drags it 20.5 px, 120 px drags it 41.1, and
  400 px drags it 46.0 — the asymptote. A hard limit feels like a wall; this
  feels like stretching something attached.
- The drag never fights a scroll. A touch that turns into a scroll makes the
  browser fire `pointercancel`, and the button lets go. Nothing calls
  `preventDefault` or sets `touch-action`.
- The child inside each element travels further than the element itself, which
  is what reads as depth rather than as a moving rectangle.
- Distance is measured to the element's **edge**, not its centre, so a wide
  button is felt along its whole length instead of only in the middle.
- The pull falls off with the square of the distance, so elements stay still
  until the pointer is genuinely close. A linear falloff makes everything on
  the page twitch at once.
- `max` caps the travel, so a fast pointer cannot fling an element across the
  layout.

### How it stays out of the way

- **It writes the standalone `translate` and `scale` properties, not
  `transform`.** A host that already has a transform on the button — a
  rotation, a skew, a framework's own animation — keeps it, because the
  browser composes them instead of one replacing the other. Writing
  `transform` is the usual way this effect quietly breaks someone's existing
  CSS.
- One `pointermove` listener on the document for the whole set, not one per
  element. A nav of twelve links costs one handler.
- Element rectangles are cached and invalidated on scroll, resize and
  `ResizeObserver`, so a pointer move does not force a layout per element.
- The animation loop stops when everything has settled, and starts again on
  the next pointer move.

### Delivery formats

- Plain HTML / any framework — `runtime/leaf-spring.js`, a UMD global, no
  build step and no dependencies.
- `dist/demo.html` — a working page that doubles as the place to tune the
  physics. It runs on ordinary interface — a nav, two buttons, three cards —
  because that is the claim: this goes on the elements you already have.

### Known limitations

- **The lean does nothing on a touch screen.** There is no hovering pointer
  on a phone, so there is nothing to lean toward. The press and the drag both
  work there, because `pointerdown` fires for a finger.
- Keyboard focus does not move an element. Moving a control as it receives
  focus is disorienting, so focus styling is left to the host page.
- An element whose `translate` or `scale` is set by the host page will have
  it overwritten; `transform` is safe, those two are not.
- A layout that shifts for a reason nothing here observes — an accordion
  opening, a route change — leaves the cached rectangles stale until the next
  scroll or resize. `refresh()` is there for that.

### Testing

- Driven in a Chromium engine on macOS. Verified by reading the DOM and by
  measurement, not by eye: the release oscillation above; the box travelling
  27.4 px with the label an extra 11.5 px; travel capped at `max`; a host's
  `transform: rotate(3deg)` surviving untouched; `prefers-reduced-motion`
  stopping it moving at all; the element returning to rest and the inline
  style being cleared; the loop idle once settled; and `destroy()` putting the
  element back as it was.
- **Not opened in Safari, Firefox or Edge, on a real phone, in a React app or
  in WordPress.** Nothing here is engine-specific, but none of that was run.
