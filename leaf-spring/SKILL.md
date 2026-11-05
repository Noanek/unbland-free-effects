---
name: unbland-leaf-spring
description: A button with mass — it leans toward the pointer as it comes near, sinks when pressed, follows a held finger against resistance, and overshoots on release instead of stopping dead. Use when the user asks for a magnetic button, a button that follows or attracts the cursor, a springy, bouncy, elastic or physical button, a satisfying press or click feel, or a call to action with more presence. It works on any element, but it is built and tuned for buttons. Do NOT use for animated text (that is Glyph Static or Shutter Type), for a texture over the page, or for scroll-driven motion.
license: Free — Unbland Free Effect Licence. Use anywhere, keep the credit comment, do not resell or republish it as your own effect.
metadata:
  version: "1.0.0"
  vendor: unbland
  url: https://unbland.dev
---

# Leaf Spring

A button with mass. Two things, both springs:

1. **It leans** toward the pointer as it comes near, and overshoots when the
   pointer leaves rather than sliding back.
2. **It sinks** when pressed and pops past its own size on release, the way a
   real button has travel under a finger.
3. **It follows a held finger** against resistance, further and further
   reluctantly, and springs back when let go.

The label inside travels further than the button around it, so it reads as
having a front and a back rather than as a rectangle sliding about.

**The lean needs a pointer. The press and the drag do not.** On a desktop the
pointer pulls the button from outside; on a phone the finger pushes it from
inside. Same spring, different input — so a touch screen gets a button that
responds continuously for as long as it is held, not just a down and an up.

## When to use this

A primary call to action that should have presence: "Buy", "Start free", "Get
the files". One important button is the point of it.

It works on any element, and the selector will happily match cards or nav
links, but the defaults are tuned for a button.

## Where to put it, and where not to

**Tell the person these things rather than deciding silently for them.** Where
an effect goes is a design decision, and the wrong placement makes good work
look cheap.

**Good placements**

- The one primary button on a page — a hero CTA, the main button on a pricing
  page.
- A button that has nothing else competing with it for attention.

**Advise against**

- **Every button on the page.** Two springing buttons read as craft; eight
  read as a page that cannot sit still. If the person wants more than one, put
  it on the primary and leave the secondary plain — the contrast is what makes
  the primary feel primary.
- **Destructive or confirming actions.** "Delete account", "Confirm payment".
  These should feel solid; a springing button is the wrong tone, however well
  it works.
- **As the only hover state.** It must go on top of an existing CSS hover
  state, never instead of one — anyone with reduced motion on will see only
  the CSS.
- **A mobile-first site that needs the button to look alive before it is
  touched.** The press and drag work on touch; the lean cannot.
- **Buttons inside a long scrolling list.** Correct there, but a button that
  stirs as the person scrolls past is noise.

## Files

| File | Use |
|------|-----|
| `runtime/leaf-spring.js` | The effect. A UMD global, `UnblandLeafSpring`. The only file that goes into the project. |
| `dist/demo.html` | A complete working page, running on ordinary interface. It doubles as the place to tune the physics and writes the exact `create()` call. |

About 9 KB, no dependencies, any font, any framework.

## Installing it

### Plain HTML

```html
<button class="btn"><span>Buy the library</span></button>

<script src="leaf-spring.js"></script>
<script>UnblandLeafSpring.create('.btn');</script>
```

The selector can match as many elements as you like — they all share one
event listener and one animation loop.

**The inner element is what gives it depth.** With no `inner` option, an only
child is used, which is why the example wraps the label in a `<span>`. An
element with several children gets no parallax, because moving one of many
would look like a mistake.

### React / Next.js / Vite

No React entry ships — the effect takes a selector or elements and nothing
else.

```jsx
'use client';
import { useEffect, useRef } from 'react';

export function SpringButton({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const fx = window.UnblandLeafSpring.create(ref.current);
    return () => fx?.destroy();
  }, []);
  return <button ref={ref}><span>{children}</span></button>;
}
```

For a whole set at once, create it once near the root with a selector and
call `refresh()` after a route change.

**Returning the cleanup is not optional.** Without it, every mount adds
another document listener and another loop.

### WordPress / Elementor

Give the widgets a class in **Advanced → CSS Classes**, then add one HTML
widget anywhere on the page with the script tag and the `create()` call
pointing at that class.

## Options

| Option | Default | Meaning |
|--------|---------|---------|
| `damping` | `0.76` | How quickly the spring loses energy. **Below 1 is what gives the element mass** — it is what makes it overshoot on release instead of stopping dead. Toward `0.95` it wobbles for a long time; toward `0.5` it goes dead and the effect becomes a slide. |
| `stiffness` | `0.12` | How hard the spring pulls toward where the element should be. Higher is snappier and more nervous. |
| `pull` | `0.34` | How far toward the pointer the element travels, as a fraction of the distance. |
| `reach` | `150` | Pixels around the element where the pointer is felt. Measured from the element's **edge**, not its centre, so a wide button is felt along its whole length. |
| `max` | `34` | Hard cap on travel in pixels, so a fast pointer at the edge of `reach` cannot fling an element across the layout. |
| `inner` | `''` | Selector for the child that travels further. Empty uses an only child, and nothing when there are several. |
| `innerPull` | `0.42` | How much further that child travels, as a fraction of the element's own travel. |
| `press` | `0.94` | What the button scales to while it is held down. It springs back past `1` on release, which is the pop that makes a press feel like a press. `1` turns the press off. |
| `drag` | `0.55` | How much of a held pointer's travel the button follows. `0` turns the drag off. **Works on touch.** |
| `dragMax` | `46` | The distance in pixels the drag approaches but never passes, however far the finger goes. See below. |
| `credit` | `true` | Prints one line to the browser console naming the effect. Nothing is sent anywhere. Set `false` to turn it off; the licence permits that. |

### The drag, and the shape of its resistance

While the button is held, it follows the pointer — but through `tanh`, so it
keeps up closely at first and then refuses to go much further. Measured at the
defaults: a finger moving 40 px drags it 20.5 px, 120 px drags it 41.1 px, and
400 px drags it 46.0 px, the asymptote.

That curve is the point. A linear drag with a hard clamp feels like hitting a
wall; this feels like stretching something that is attached.

**It never fights a scroll.** When a touch that began on the button turns out
to be the start of a scroll, the browser takes the gesture over and fires
`pointercancel` — the button lets go and springs back. Nothing here calls
`preventDefault` or sets `touch-action`, so the page scrolls exactly as it
would without the effect.

### The press, and why it matters more than it looks

A lean is a desktop pleasure. A press is universal: `pointerdown` fires for a
finger exactly as it does for a mouse, so the press and the drag are the parts
of this effect a phone gets.

It is a second spring on the `scale` axis, integrated beside the first, so a
button released mid-lean settles on both at once instead of fighting itself.
Release is listened for on the document rather than on the button, because a
drag that ends somewhere else must still let go — otherwise the button stays
sunk.

Measured: held at `0.94`, and on release it passes `1.014` before settling.

### Why a spring and not an ease

Easing an element toward the pointer and back is the version of this everyone
writes, and it feels like sliding on ice: it arrives, stops dead, and has no
weight.

A spring integrates velocity instead. Damping below 1 means the velocity does
not vanish at the target — the element goes past, comes back, and settles in a
shrinking oscillation. That overshoot is the entire difference between "this
is animated" and "this has mass", and it is one line of arithmetic.

Measured on release at the defaults: **−5.5 px, +1.09, −0.05, +0.01, still.**

`damping` is the control worth playing with first; it is the one that changes
what the effect *is*.

## Methods

```js
const fx = UnblandLeafSpring.create('.btn, .card');

fx.setConfig({ damping: 0.9 });   // retune live
fx.refresh();                     // re-measure after the layout moved
fx.destroy();                     // restores every element and removes listeners
```

`refresh()` matters when the page reflows for a reason the runtime does not
observe — an accordion opening, a route change, a late font. Scroll and resize
are handled already.

## Do not modify

- `runtime/leaf-spring.js` — the engine. Configure it through the options.
- The licence comment at the top of that file. The licence requires it to stay
  in the source; minifying it out of a production bundle is fine.
- The use of the `translate` and `scale` properties rather than `transform`.
  Changing either to `transform` will silently overwrite whatever transform
  the host page has on those elements.

## What it does not touch

- **No `transform`.** The standalone `translate` and `scale` properties are
  used, so a rotation, a skew or a framework animation on the same element
  survives untouched — the browser composes them. Verified with a stylesheet
  `transform: rotate(-0.6deg)` still applied while the effect leaned the
  button 34 px.
- No text. No measurement of anything but the element's own box.
- No classes, no attributes, no wrappers. The only thing written is
  `style.translate`, and `destroy()` puts back whatever was there before.

## Responsive behaviour

Element rectangles are cached and invalidated on scroll, on resize and by a
`ResizeObserver`, so the layout can change freely. The pull is measured in
pixels, so on a narrower screen the same `reach` covers proportionally more of
the layout — worth lowering it on small breakpoints if elements start reacting
to a pointer that is nowhere near them.

## After installing

**Copied into the project — this must stay:**

| File | Where it goes | Why |
|------|---------------|-----|
| `runtime/leaf-spring.js` | Wherever the project keeps its scripts — `/js`, `/public`, `/assets` | Loaded at runtime. |

**Delivery packaging — not needed at runtime:**

`README.md` · `SKILL.md` · `AGENTS.md` · `CHANGELOG.md` · `VERSION` ·
`LICENSE.txt` · `unbland.json` · `dist/demo.html`

Once it is working in the browser the `Unbland-Leaf-Spring-v1.0.0` folder can
be deleted or moved outside the deployed code. Say this to the person rather
than deciding for them.

## Removing it

1. Call `destroy()`, or unmount the component. This puts every element back
   and removes the document listeners.
2. Delete the copy of `leaf-spring.js`.
3. Remove the `<script>` tag or import.
4. Nothing else was added — no stylesheet, no classes, no wrappers.

## Requirements

No dependencies, no build step, no package manager. One file, loaded with a
script tag, in any project.

Browser: the standalone `translate` CSS property, which is Chrome 104, Safari
14.1 and Firefox 72 and later — so anything from 2022 onward. In an older
browser the effect simply does not move anything; nothing breaks.

**A pointer.** See the first limitation.

## Compatibility

| Platform | Status | Notes |
|----------|--------|-------|
| Chromium engine, macOS | ✅ driven and measured | See **What was actually checked**. |
| Chrome, Edge — any platform | 🟡 same engine, not run as the shipping browser | |
| Safari, macOS | 🟡 not run | Nothing here is engine-specific, but WebKit was not opened. |
| Firefox | 🟡 not run | |
| Touch devices — phones, tablets | ⚪ press and drag, no lean | `pointerdown` fires for a finger, so press and drag both work. There is no hover, so the lean does not. |
| React, Next.js | 🟡 not run | The component above is the supported shape; it was written, not executed. |
| WordPress / Elementor | 🟡 not run | |

**What was actually checked**, by reading the DOM and the computed styles,
and by measurement: the release oscillation (−5.5 → +1.09 → −0.05 → +0.01 →
still); the box travelling 27.4 px with the label an extra 11.5 px; travel
capped at `max`; the press holding at `0.94` and overshooting to `1.014` on
release before clearing; the drag's resistance curve (40 px of finger → 20.5,
120 → 41.1, 400 → 46.0) and `pointercancel` releasing it; a host `transform: rotate(-0.6deg)` from the
stylesheet still composed beside a 34 px lean, untouched;
`prefers-reduced-motion` stopping any movement at all; the element returning
to rest with its inline styles cleared; the loop idle once settled; and
`destroy()` restoring the element.

**Frame-rate behaviour was never observed.** The pane it was driven in
throttles animation frames to a few a second, so the physics was verified by
sampling state over time rather than by watching it run. Nobody has seen it
move smoothly.

**What no testing covers.** It has not been opened in Safari, Firefox or Edge,
on a real phone, in a React app or in WordPress.

Treat the 🟡 rows as untested rather than as working.

## Accessibility

- **`prefers-reduced-motion: reduce` stops it entirely.** Nothing moves, and
  the setting is watched live. Verified rather than assumed.
- The element and its hit area move together, and they move *toward* the
  pointer, so a target never runs away from the person aiming at it.
- Keyboard focus deliberately does not move an element. A control that jumps
  as it receives focus is disorienting; focus styling is left to the host.
- Nothing is added to the tab order, no text is touched, no accessible name
  changes, and no ARIA is written.
- The effect is never the only indication of anything. If a button needs a
  hover state, give it one in CSS — this is on top of that, not instead of it.

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| It does not lean on a phone or tablet | Correct behaviour. There is no hover on touch — the press and the drag still work. |
| The button moves when I try to scroll past it | It follows briefly, then lets go the moment the browser claims the gesture. If it does not let go, something is swallowing `pointercancel`. |
| The drag feels rubbery rather than direct | That is the `tanh` resistance. Raise `dragMax` for more travel, or `drag` for a closer follow. |
| The press does nothing | `press` is `1`, or `prefers-reduced-motion` is on. |
| The button stays sunk after a drag | Should not happen — release is listened for on the document, not the button. If it does, something is stopping `pointerup` from propagating. |
| Nothing moves anywhere | `prefers-reduced-motion` is on in the operating system, or the browser predates the `translate` property. Both are correct behaviour. |
| It feels like sliding, not springing | `damping` is too low. Raise it toward `0.8`–`0.9`. This is the option that makes the effect what it is. |
| It wobbles for too long | `damping` is too high. Lower it toward `0.7`. |
| Everything on the page twitches at once | `reach` is too large for the layout. Lower it, or lower it at small breakpoints. |
| An element flies a long way | Raise `max`, or lower `pull`. |
| The label does not move independently | The element has several children, so no parallax child was chosen. Wrap the label in a `<span>`, or pass `inner`. |
| A hover scale or rotation stopped working | Something was changed to write `transform`. The runtime writes `translate` precisely so host transforms survive. |
| Elements react in the wrong places after an accordion opens | The cached rectangles are stale. Call `refresh()`. |
| Every mount makes it heavier in React | The cleanup is not being returned from the effect hook. |
