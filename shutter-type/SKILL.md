---
name: unbland-shutter-type
description: Letters arrive from under their own clipped edge, with the reveal sweeping across the block as one front. Use when the user asks for a text reveal, a headline that wipes or masks in, letters that slide up into place, a staggered character reveal on scroll, a kinetic-typography entrance, or a title animation. Do NOT use for text whose weight or width animates (that is Axis Wave), for text that scrambles or decodes (that is Glyph Static), for a typewriter effect, or on body copy — it is built for headings.
license: Free — Unbland Free Effect Licence. Use anywhere, keep the credit comment, do not resell or republish it as your own effect.
metadata:
  version: "1.0.0"
  vendor: unbland
  url: https://unbland.dev
---

# Shutter Type

Each character is clipped to its own box and slides out from under the edge of
that box, so the line is uncovered rather than faded in. The reveal crosses the
whole block as a single front.

The shutter is the clipping edge itself. Nothing is drawn over the text — there
is no bar, no wipe layer, no overlay of any kind.

No canvas, no dependency. The runtime splits the text into clipped spans and
transforms the glyph inside each one.

## When to use this

A heading that arrives as the section scrolls into view. A hero line on load. A
nav label or a card title on hover. Anywhere the text should feel uncovered
rather than faded.

## Where to put it, and where not to

**Tell the person these things rather than deciding silently for them.**

**Good placements**

- A hero line with `trigger: 'load'`. This is the quietest of the text effects
  and the one that survives being the first thing seen.
- Section titles with `trigger: 'view'`.
- Card or list titles revealing in sequence as a grid comes into view.
- Hebrew and Arabic headings — the reveal reverses from the element's own
  direction with no configuration.

**Advise against**

- **Body copy.** A paragraph uncovering itself is tiring rather than elegant.
- **Anything that must be readable immediately** — prices, errors, form
  labels, legal text.
- **`trigger: 'view'` on text the reader needs regardless.**
- **Lines mixing Hebrew or Arabic with Latin or digits.** Right-to-left on its
  own is correct and was tested; mixed is not.
- **Text that changes.** The effect takes the text once.
- **The same page as Glyph Static.** Pick one — Glyph Static is technical and
  noisy, this is quiet and cinematic.
- **Heavy negative letter-spacing.** Characters are clipped to their own
  boxes, and very tight tracking can clip the letters. `from: 'behind'` avoids
  it.

## Files

| File | Use |
|------|-----|
| `runtime/shutter-type.js` | The effect. A UMD global, `UnblandShutterType`. The only file that goes into the project. |
| `dist/demo.html` | A complete working page. It doubles as the place to tune the settings — it writes the exact `create()` call for whatever you set, and carries a right-to-left specimen. |

Roughly 11 KB, no dependencies, any font.

## Installing it

### Plain HTML

```html
<h1 id="headline">Uncovered, not faded</h1>

<script src="shutter-type.js"></script>
<script>
  UnblandShutterType.create('#headline');
</script>
```

The element needs no particular position, height or background.

### React / Next.js / Vite

No React entry ships — the effect needs a DOM node and nothing else.

```jsx
'use client';                      // Next.js App Router only
import { useEffect, useRef } from 'react';

export function Headline({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const fx = window.UnblandShutterType.create(ref.current, { trigger: 'view' });
    return () => fx?.destroy();     // returning this is what makes it safe
  }, []);
  return <h1 ref={ref}>{children}</h1>;
}
```

**Returning the cleanup is not optional.** React's development mode mounts every
component twice; without it the second mount splits the already-split spans.

**The text must be static.** The runtime takes the element's text once. If
`children` changes, destroy and re-create.

### WordPress / Elementor

An HTML widget with the `<script src>` tag, then a second HTML widget after the
heading with the `create()` call pointing at the heading's CSS ID. Set the ID in
the heading widget's **Advanced → CSS ID** field.

## Options

| Option | Default | Meaning |
|--------|---------|---------|
| `duration` | `900` | Milliseconds for the reveal to cross the whole block. |
| `settle` | `520` | Milliseconds any one character takes to arrive. Must be less than `duration`, or every character starts at once. |
| `from` | `'below'` | `'below'` / `'above'` — the glyph slides out from under that edge. `'behind'` — it fades in place without moving, for text whose position must not shift at all. |
| `sweep` | `'auto'` | Which way the reveal runs. `'auto'` reads the element's own `direction`, so right-to-left text is uncovered from the right without being told. `'ltr'` / `'rtl'` force it. |
| `trigger` | `'view'` | `'view'` — when it scrolls into sight. `'hover'` — on pointer enter. `'load'` — immediately. `'manual'` — only when you call `play()`. |
| `threshold` | `0.4` | How much of the element must be visible for `'view'`, from `0` to `1`. |
| `once` | `true` | Whether `'view'` and `'hover'` run only the first time. |
| `credit` | `true` | Prints one line to the browser console naming the effect. Nothing is sent anywhere. Set `false` to turn it off; the licence permits that. |

### The stagger follows position, not index

On a heading that wraps, staggering by the character's index in the string runs
along line one and then starts line two over at the left, so the reveal would
jump backwards in the middle of a heading.

So the stagger is computed from each character's position across the block. It
is one front crossing the text, on one line or four.

### Why the timing is measured to the last letter

The stagger is normalised between the first character's edge and the last
one's, not across the element's box. A centred or wrapped heading has a box
wider than any line in it, so measuring against the box would leave the reveal
still running after the last letter had already arrived.

## Methods

```js
const fx = UnblandShutterType.create('#headline', { trigger: 'manual' });

fx.play();      // run it (or run it again)
fx.reveal();    // jump straight to the finished text, no animation
fx.destroy();   // restore the element exactly as it was
```

## Do not modify

- `runtime/shutter-type.js` — the engine. Configure it through the options.
- The licence comment at the top of that file. The licence requires it to stay
  in the source; minifying it out of a production bundle is fine.
- The `.st-c`, `.st-g`, `.st-w` and `.st-root` spans the runtime creates. They
  are rebuilt on every `create()` and anything written onto them is lost.
- The `padding-block` / `margin-block` pair on `.st-c`. They are what stop
  descenders being clipped, and they cancel out so the layout is unchanged.
  Changing one without the other will either clip letters or move the line.

To style the text, style the host element — the spans inherit from it.

## Responsive behaviour

A `ResizeObserver` re-measures the character positions whenever the element
changes width, including when a webfont lands late. Nothing needs to be called
on resize.

A resize *part-way through a run* is deliberately not handled: the rest of that
pass stays staggered to the layout it started with. The finished text is
correct, and the next run re-measures. Re-deriving the stagger mid-flight would
make characters jump.

## After installing

**Copied into the project — this must stay:**

| File | Where it goes | Why |
|------|---------------|-----|
| `runtime/shutter-type.js` | Wherever the project keeps its scripts — `/js`, `/public`, `/assets` | Loaded at runtime. |

**Delivery packaging — not needed at runtime:**

`README.md` · `SKILL.md` · `AGENTS.md` · `CHANGELOG.md` · `VERSION` ·
`LICENSE.txt` · `unbland.json` · `dist/demo.html`

Once the effect is working in the browser the `Unbland-Shutter-Type-v1.0.0`
folder can be deleted or moved outside the deployed code. Say this to the
person rather than deciding for them.

## Removing it

1. Call `destroy()`, or unmount the component. This puts the original text
   back; a half-removed instance can leave the text hidden.
2. Delete the copy of `shutter-type.js`.
3. Remove the `<script>` tag or import.
4. Nothing else was added, beyond one `<style id="st-style">` in the document
   head, which is harmless if left.

## Requirements

No dependencies, no build step, no package manager. One file, loaded with a
script tag, in any project.

Browser: anything with `IntersectionObserver`, which is every browser released
since 2019. Without it, `trigger: 'view'` falls back to running immediately
rather than never running.

Any font. Nothing here needs a variable font.

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
stopping it dead, and the geometry each effect depends on. Hebrew, `dir="rtl"`, was
among the states driven: the reveal reverses and the right-hand characters
arrive first. Arabic was not.

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
  carries the original string as its `aria-label`, so a screen reader is given
  the sentence rather than a column of single letters. An `aria-label` already
  on the element is left alone.
- Nothing is added to the tab order and no focus behaviour changes.
- **`prefers-reduced-motion: reduce` skips the animation entirely.** The text
  is shown in place, immediately, and is never hidden. The setting is watched
  live, so turning it on mid-run finishes the run at once.
- `reveal()` is there so a page can offer its own skip control.
- Text hidden by `trigger: 'view'` is hidden visually but is still in the
  accessibility tree with its label, so it is never missing from the page for
  someone using a screen reader.

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| The text never appears | `trigger: 'view'` on an element that never scrolls into sight. Check it is not inside a hidden or zero-height container. |
| Nothing animates; the text is just there | `prefers-reduced-motion` is on in the operating system. This is correct behaviour. |
| It only runs once | Correct behaviour with `once: true`. Set it `false`. |
| Descenders on g, j, p, q, y are cut off | The `padding-block` / `margin-block` pair on `.st-c` was changed or overridden. Restore it, or use `from: 'behind'`. |
| Letters are clipped at the sides | Heavy negative `letter-spacing`, or a font with long swashes. Use `from: 'behind'`, which does not move the glyph. |
| The reveal runs the wrong way on Hebrew or Arabic | `sweep` was forced to `'ltr'`. Set it `'auto'`. |
| Every character starts at once | `settle` is greater than or equal to `duration`, so there is no room left to stagger the starts. |
| Right-to-left text comes out in the wrong order | Known limitation on lines that mix RTL with Latin or digits. RTL text on its own is correct. |
| The line jumps when the effect ends | Something is overriding the `.st-c` margins. The padding and margin there must stay a matched pair. |
