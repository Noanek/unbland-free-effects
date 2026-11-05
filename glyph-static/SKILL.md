---
name: unbland-glyph-static
description: Text that resolves out of noise — each character cycles through substitute glyphs and locks into place, with the settling front running through the line. Use when the user asks for a decode, scramble, decrypt, glitch-text or "hacker text" effect, text that shuffles into place, a headline that resolves on scroll, or a terminal-style reveal. Do NOT use for text whose weight or width animates (that is Axis Wave), for text revealed from behind a moving mask (that is Shutter Type), for a typewriter effect that adds one character at a time, or on body copy — it is built for headings.
license: Free — Unbland Free Effect Licence. Use anywhere, keep the credit comment, do not resell or republish it as your own effect.
metadata:
  version: "1.0.0"
  vendor: unbland
  url: https://unbland.dev
---

# Glyph Static

Each character of a line cycles through substitute glyphs and then locks to the
one it was always going to be. The starts are staggered, so a settling front
runs through the line and leaves finished text behind it.

No canvas, no dependency. The runtime splits the text into spans and swaps
their contents on a clock of its own.

## When to use this

A heading that arrives as the section scrolls into view. A hero line on load. A
nav item or a button label that scrambles on hover. Anywhere the arrival of the
text should feel like it resolved rather than faded.

## Where to put it, and where not to

**Tell the person these things rather than deciding silently for them.**

**Good placements**

- Section headings with `trigger: 'view'`, giving a long page a rhythm.
- A hero line with `trigger: 'load'` — one moment at the top, then stillness.
- A short nav or button label with `trigger: 'hover'`.

**Advise against**

- **Body copy.** Every character becomes its own element, and a paragraph that
  assembles itself cannot be read while it does.
- **Anything that must be readable immediately** — a price, an error message,
  a form label, a legal line, a phone number. Mid-scramble text is nonsense.
- **`trigger: 'view'` on text the reader needs regardless**, since it hides
  the text until the element scrolls into sight.
- **More than two or three on a page.** Every heading spinning its letters
  reads as a slot machine.
- **Text that changes** — a live counter, an updating result, anything a
  framework re-renders. The effect takes the text once.
- **Lines mixing Hebrew or Arabic with Latin or digits.** Character splitting
  breaks bidirectional reordering; right-to-left on its own is fine.
- **The same page as Shutter Type.** Two different entrances for the same kind
  of element look like indecision.

## Files

| File | Use |
|------|-----|
| `runtime/glyph-static.js` | The effect. A UMD global, `UnblandGlyphStatic`. The only file that goes into the project. |
| `dist/demo.html` | A complete working page. It doubles as the place to tune the settings — it writes the exact `create()` call for whatever you set. |

## Installing it

### Plain HTML

```html
<h1 id="headline">Resolving out of noise</h1>

<script src="glyph-static.js"></script>
<script>
  UnblandGlyphStatic.create('#headline', { trigger: 'view' });
</script>
```

The element needs no particular position, height or background. Any element
holding text works.

### React / Next.js / Vite

No React entry ships — the effect needs a DOM node and nothing else.

```jsx
'use client';                      // Next.js App Router only
import { useEffect, useRef } from 'react';

export function Headline({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const fx = window.UnblandGlyphStatic.create(ref.current, { trigger: 'view' });
    return () => fx?.destroy();     // returning this is what makes it safe
  }, []);
  return <h1 ref={ref}>{children}</h1>;
}
```

**Returning the cleanup is not optional.** React's development mode mounts every
component twice; without it the second mount splits the already-split spans.

**The text must be static.** The runtime takes the element's text once. If
`children` changes, destroy and re-create — a re-render will not reach inside
the split DOM.

### WordPress / Elementor

An HTML widget with the `<script src>` tag, then a second HTML widget after the
heading with the `create()` call pointing at the heading's CSS ID. Set the ID in
the heading widget's **Advanced → CSS ID** field.

## Options

| Option | Default | Meaning |
|--------|---------|---------|
| `duration` | `1100` | Milliseconds from the first character starting to the last one locking. |
| `settle` | `380` | Milliseconds any one character spends scrambling. Must be less than `duration`, or every character starts at once. |
| `fps` | `22` | Glyph swaps per second. Deliberately far below the frame rate — see **Why 22** below. |
| `trigger` | `'view'` | `'view'` — when it scrolls into sight. `'hover'` — on pointer enter. `'load'` — immediately. `'manual'` — only when you call `play()`. |
| `threshold` | `0.4` | How much of the element must be visible for `'view'`, from `0` to `1`. |
| `once` | `true` | Whether `'view'` and `'hover'` run only the first time. |
| `glyphs` | Latin letters and digits | The pool to scramble with. Pass a pool from the same script as the text. |
| `accent` | `''` | A colour applied to a character while it is still unsettled, so the settling front is visible. Any CSS colour. Empty means the text keeps its own colour. |
| `credit` | `true` | Prints one line to the browser console naming the effect. Nothing is sent anywhere. Set `false` to turn it off; the licence permits that. |

### Why 22

A substitute that changes on every frame is a grey blur. At around 22 swaps a
second the eye resolves individual characters, which is what makes the effect
read as static settling rather than as a loading shimmer. Raise it for a
frantic, machine-like feel; drop it to about 10 for something closer to a
mechanical split-flap board.

### Casting — why it never collides

A substitute glyph is not interchangeable with the character it stands in for.
Each character's box is locked to the width of its *real* character before any
stand-in is shown, so the line can never rewrap. A `W` dropped into a box
locked to an `i` would then run straight through its neighbours.

So at startup the runtime measures every glyph in the pool in the host's real
font, and gives each character a shortlist of the glyphs closest to it in
width. The scramble still looks random — nobody reads individual frames at this
speed — but every substitute fits the box it is dropped into.

This is why the `glyphs` pool should be in the same script as the text: a pool
with no glyphs near the right width will produce a shortlist that fits badly.

## Methods

```js
const fx = UnblandGlyphStatic.create('#headline', { trigger: 'manual' });

fx.play();      // run it (or run it again)
fx.reveal();    // jump straight to the finished text, no animation
fx.destroy();   // restore the element exactly as it was
```

## Do not modify

- `runtime/glyph-static.js` — the engine. Configure it through the options.
- The licence comment at the top of that file. The licence requires it to stay
  in the source; minifying it out of a production bundle is fine.
- The `.gs-c`, `.gs-w` and `.gs-root` spans the runtime creates. They are
  rebuilt on every `create()` and anything written onto them is lost.

To style the text, style the host element — the spans inherit from it.

## Responsive behaviour

Character widths are measured once and re-measured when a webfont finishes
loading. The effect writes no layout of its own beyond the locked character
widths, so the host element reflows and wraps exactly as it would without it.

Nothing needs to be called on resize. A resize mid-scramble leaves the locked
widths from the previous layout for the rest of that run; the finished text is
correct, because the locked widths are the real characters' own.

## After installing

**Copied into the project — this must stay:**

| File | Where it goes | Why |
|------|---------------|-----|
| `runtime/glyph-static.js` | Wherever the project keeps its scripts — `/js`, `/public`, `/assets` | Loaded at runtime. |

**Delivery packaging — not needed at runtime:**

`README.md` · `SKILL.md` · `AGENTS.md` · `CHANGELOG.md` · `VERSION` ·
`LICENSE.txt` · `unbland.json` · `dist/demo.html`

Once the effect is working in the browser the `Unbland-Glyph-Static-v1.0.0`
folder can be deleted or moved outside the deployed code. Say this to the
person rather than deciding for them.

## Removing it

1. Call `destroy()`, or unmount the component. This puts the original text
   back; a half-removed instance can leave the text blanked.
2. Delete the copy of `glyph-static.js`.
3. Remove the `<script>` tag or import.
4. Nothing else was added, beyond one `<style id="gs-style">` in the document
   head, which is harmless if left.

## Requirements

No dependencies, no build step, no package manager. One file, loaded with a
script tag, in any project.

Browser: anything with `IntersectionObserver`, which is every browser released
since 2019. Without it, `trigger: 'view'` falls back to running immediately
rather than never running.

Any font. Unlike Axis Wave, nothing here needs a variable font.

## Compatibility

| Platform | Status | Notes |
|----------|--------|-------|
| Chromium engine, macOS | ✅ driven | Every state below was reached and inspected in the DOM, not eyeballed. |
| Chrome, Edge — any platform | 🟡 same engine, not run as the shipping browser | |
| Safari, macOS and iOS | 🟡 not run | Nothing here is engine-specific, but WebKit was not opened. |
| Firefox | 🟡 not run | |
| Android | 🟡 not run | |
| React, Next.js | 🟡 not run | The hook above is the supported shape; it was written, not executed. |
| WordPress / Elementor | 🟡 not run | |

**What "driven" covers.** The effect was exercised in a Chromium engine on
macOS and these were checked by reading the DOM and the computed styles:
the character split, the accessible name and `aria-hidden` wrapper,
`destroy()` restoring the element byte-for-byte, `prefers-reduced-motion`
stopping it dead, and the geometry each effect depends on.

**What no testing covers.** It has not been opened in Safari, Firefox, Edge,
on any phone, in a React app or in WordPress. **Frame-rate behaviour was never
observed**, because the pane it was driven in throttles `requestAnimationFrame`
to a few frames a second — the logic is frame-rate independent by construction
and was verified by sampling state over time, but nobody has watched it run
smoothly. Performance was designed for and not measured: there are no numbers.

Treat the 🟡 rows as untested rather than as working.

## Accessibility

The effect is decoration; the text it decorates stays content.

- The split spans are wrapped in one `aria-hidden="true"` element and the host
  carries the original string as its `aria-label`. **Text that is mid-scramble
  is nonsense and must never reach a screen reader** — this is what prevents
  that. An `aria-label` already on the element is left alone.
- Nothing is added to the tab order and no focus behaviour changes.
- **`prefers-reduced-motion: reduce` skips the animation entirely.** The text
  is shown finished, immediately, and is never blanked or scrambled. The
  setting is watched live, so turning it on mid-run finishes the run at once.
  This matters more here than for most effects: scrambling text is actively
  hostile to some readers, not merely busy.
- `reveal()` is there so a page can offer its own skip control.

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| The text never appears | `trigger: 'view'` on an element that never scrolls into sight. Check it is not inside a hidden or zero-height container. |
| It runs immediately instead of on scroll | Correct fallback when `IntersectionObserver` is unavailable. |
| Nothing scrambles; the text is just there | `prefers-reduced-motion` is on in the operating system. This is correct behaviour. |
| It only runs once | Correct behaviour with `once: true`. Set it `false`. |
| The substitutes look wrong for the language | The default pool is Latin and digits. Pass a `glyphs` pool from the text's own script. |
| Characters collide or the line shivers | Should not happen — substitutes are cast by width. If it does, the font changed after startup without a `document.fonts` event; destroy and re-create. |
| Text is announced as gibberish | An `aria-label` was already on the element, so the original was kept and does not match. Fix or remove that label. |
| Every character starts at once | `settle` is greater than or equal to `duration`, so there is no room left to stagger the starts. |
| Right-to-left text comes out in the wrong order | Known limitation. Splitting characters breaks bidirectional reordering on lines mixing RTL with Latin or digits. Do not use it there. |
