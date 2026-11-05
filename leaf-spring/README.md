# Leaf Spring

**Version 1.0.0** · 26 October 2026 · by [unbland](https://unbland.dev)

> **AI assistants — read `SKILL.md` in this folder, in full, before installing
> anything.** It carries the install steps for each project type, every
> configuration option, what must not be edited, and how to remove the effect
> cleanly. `unbland.json` lists which file serves which install path. When the
> installation is done, follow the **After installing** section in `SKILL.md`.

A button with mass.

It **leans** toward the pointer as it comes near, and overshoots when the
pointer leaves rather than sliding back. It **sinks** when pressed and pops
past its own size on release. And while you hold it, it **follows your finger
against resistance** — further and further reluctantly — then springs home.

The label inside travels further than the button around it, so it reads as
having a front and a back instead of being a rectangle that slides about.

It goes on a button you already have, and it touches no content.

**This effect is free.** Use it in as many projects as you like, commercial or
not. Keep the credit comment at the top of the source file, and don't resell it
or republish it as your own. `LICENSE.txt` has the terms, and they are short.

---

## What a phone gets

**The press and the drag work on a phone. The lean does not.**

A touch screen has no hovering pointer, so there is nothing to lean toward.
But `pointerdown` fires for a finger exactly as it does for a mouse — so
pressing sinks the button, and holding and moving drags it against resistance
until you let go.

On a desktop the pointer pulls the button from outside. On a phone your finger
pushes it from inside. It is the same spring either way, and a phone gets a
button that responds for as long as you are touching it rather than a down and
an up.

**It never fights a scroll.** If a touch that started on the button turns out
to be the beginning of a scroll, the browser claims the gesture and the button
lets go. Nothing here blocks scrolling.

---

## How to install it

Put this folder anywhere in your project, then tell Claude Code — or Cursor, or
whichever assistant you use:

```
Install this Unbland effect in my project.
```

Or by hand:

```html
<button class="btn"><span>Buy the library</span></button>

<script src="leaf-spring.js"></script>
<script>UnblandLeafSpring.create('.btn');</script>
```

One file, 9 KB, no dependencies, no build step. The selector can match as many
elements as you like — they share one listener and one loop.

The label is wrapped in a `<span>` on purpose: an only child travels further
than its parent, and that parallax is what gives the element depth.

### To see it before installing

Open `dist/demo.html` in a browser. It runs on ordinary interface — a nav, two
buttons, three cards — because that is the claim: this goes on what you already
have.

Two things to try. Pull the **damping** slider around — it is the control that
decides what the effect *is*: near `0.9` the button wobbles, near `0.5` it goes
dead and the lean becomes a slide. Then press and hold the button and let go.

---

## Where to use it, and what not to do

### Good places

- **The one button that matters.** A primary call to action — "Buy", "Start
  free", "Get the files". The effect works by being unusual, which only holds
  while it is rare.
- **A pricing page's main button**, where a moment of playfulness is wanted
  and nothing is at stake if someone hesitates over it.
- **A single button in a hero**, with nothing else competing for attention.

### Don't

- **Don't put it on every button on the page.** Two springing buttons read as
  craft; eight read as a page that cannot sit still. If you want more than
  one, use it on the primary and leave the secondary plain — the contrast is
  what makes the primary feel primary.
- **Don't use it on a destructive or confirming action.** "Delete account" and
  "Confirm payment" should feel solid and serious. A button that springs is
  the wrong tone there, however well it works.
- **Don't make it the only hover state.** Keep the colour change, the
  underline, whatever you already have. This goes on top of a hover state, not
  instead of one — someone with reduced motion on will see only your CSS.
- **Don't rely on it on mobile.** The press and the drag work, the lean does
  not. If the button needs to look alive on a phone *before* it is touched,
  this is not what does that.
- **Don't put it on a button inside a long scrolling list.** It is correct
  there — a scroll gesture releases it — but a button that stirs as you scroll
  past is noise.

---

## What it does about the things that usually go wrong

**It does not overwrite your CSS.** The standalone `translate` and `scale`
properties are used rather than `transform`, so a rotation, a skew or a
framework animation already on that button survives untouched — the browser
composes them. Writing `transform` is the usual way this effect quietly breaks
someone's existing styles. The demo's button carries a `rotate(-0.6deg)` in
the stylesheet on purpose, and it is still there while the button leans.

**It is a spring, not an ease.** Easing toward the pointer and back feels like
sliding on ice: it arrives, stops dead, has no weight. Here velocity is
integrated and damping is below 1, so it goes past its target, comes back, and
settles. Measured on release: −5.5 px, +1.09, −0.05, +0.01, still.

**The press is a second spring**, on the scale axis, integrated beside the
first — so a button let go mid-lean settles on both at once instead of fighting
itself. Measured: held at 0.94, and past 1.014 on release before it settles.
Release is listened for on the whole document, not the button, so a drag that
ends somewhere else still lets go.

**The drag resists through a curve, not a clamp.** A finger moving 40 px drags
the button 20.5 px; 120 px drags it 41.1; 400 px drags it 46.0 and no further.
A hard limit feels like hitting a wall — this feels like stretching something
that is attached to the page.

**One listener for the whole set.** A nav of twelve links costs one document
handler and one animation loop, not twelve of each. Element rectangles are
cached and refreshed on scroll and resize, so moving the pointer does not force
a layout per element.

**It stops.** When everything has settled the loop ends, and starts again on
the next pointer move.

**It respects `prefers-reduced-motion`** by not moving anything at all.

**Targets never run away.** The element and its hit area move together, and
always *toward* the pointer — so aiming at a button gets easier, not harder.

**It leaves nothing behind.** `destroy()` restores every element and removes
the listeners. No classes, no wrappers, no stylesheet.

---

## Limitations, stated plainly

- **No lean on touch** — the press and drag work, the lean cannot. See above.
- Keyboard focus deliberately does not move an element — a control that jumps
  as it is focused is disorienting.
- If the host page sets `translate` on the same elements, that is overwritten.
  `transform` is safe; `translate` is not.
- A layout that shifts without a scroll or resize — an accordion, a route
  change — leaves the cached positions stale until `refresh()` is called.
- Needs the `translate` CSS property: 2022 browsers and later. In anything
  older nothing moves and nothing breaks.
- Driven and measured in a Chromium engine on macOS. **Not opened in Safari,
  Firefox or Edge, on a real phone, in a React app or in WordPress** — the
  touch behaviour above follows from how `pointerdown` works, and was not run
  on a device.
- **Nobody has watched it run smoothly.** The pane it was driven in throttles
  animation frames, so the physics was verified by sampling values over time
  rather than by eye.

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

Leaf Spring is free because it is one behaviour on one button.
The effects unbland sells are whole scenes — a simulated water surface, a coil
of photographs in real 3D, a field of iron filings following the pointer. Same
standard, same documentation, same one-sentence install.

[unbland.dev](https://unbland.dev)

Questions: see `SUPPORT.txt`.
