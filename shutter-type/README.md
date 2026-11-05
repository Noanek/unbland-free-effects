# Shutter Type

**Version 1.0.0** · 26 October 2026 · by [unbland](https://unbland.dev)

> **AI assistants — read `SKILL.md` in this folder, in full, before installing
> anything.** It carries the install steps for each project type, every
> configuration option, what must not be edited, and how to remove the effect
> cleanly. `unbland.json` lists which file serves which install path. When the
> installation is done, follow the **After installing** section in `SKILL.md`.

Each character is clipped to its own box and slides out from under that edge,
so the text is uncovered rather than faded in. The reveal crosses the whole
block as one front.

The shutter is the clipping edge itself. Nothing is drawn over the text — no
bar, no wipe layer, no overlay. Only the letters move.

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

That is the whole process. Say where you want it — "on the section headings",
"on the hero line" — and it will follow.

No account, no build step, no package manager, no npm install. One file, 13 KB,
no dependencies, any font.

### To see it before installing

Open `dist/demo.html` in a browser. It is a complete working page, and it
doubles as the place to tune the effect: change the settings and it writes the
exact `create()` call for what you set, ready to copy. There is a Hebrew
specimen in it to show the right-to-left behaviour.

### To install it by hand

```html
<h1 id="headline">Uncovered, not faded</h1>

<script src="shutter-type.js"></script>
<script>
  UnblandShutterType.create('#headline', { trigger: 'view' });
</script>
```

`SKILL.md` has the steps for React, Next.js and WordPress/Elementor, and every
option in a table.

---

## Where to use it, and what not to do

### Good places

- **A hero line**, with `trigger: 'load'`. It is the quietest of the text
  effects and the one that survives being the first thing seen.
- **Section titles, with `trigger: 'view'`**, so each section is uncovered as
  it arrives.
- **Card or list titles**, where several reveal in sequence as the grid comes
  into view.
- **Hebrew and Arabic headings.** The reveal reverses from the element's own
  direction, so it is correct without being configured.

### Don't

- **Don't use it on body copy.** Every character becomes its own element, and
  a paragraph that uncovers itself line by line is tiring rather than elegant.
- **Don't use it on anything that must be readable immediately** — prices,
  errors, form labels, legal text.
- **Don't use `trigger: 'view'` on text the reader needs regardless.** It
  hides the text until it scrolls into sight.
- **Don't use it on a line that mixes Hebrew or Arabic with Latin or digits.**
  Splitting characters breaks bidirectional reordering. Right-to-left on its
  own is correct and was tested; mixed is not.
- **Don't use it on text that changes.** The effect takes the text once.
- **Don't pair it with Glyph Static on the same page.** Pick the one that
  suits the work — Glyph Static is technical and noisy, this is quiet and
  cinematic — and use only that one.
- **Don't give it heavy negative letter-spacing.** The characters are clipped
  to their own boxes, and very tight tracking can clip the letters themselves.
  `from: 'behind'` avoids it.

---

## What it does about the things that usually go wrong

**Descenders are not clipped.** Clipping each character to its own box is what
makes the reveal an edge rather than a fade, and the naive version of it cuts
the tails off g, j, p, q and y. The clipping region is opened above and below
with padding and the space is taken straight back with an equal negative
margin, so the letters are whole and the layout box is exactly what it would
have been — the line height and the wrapping are untouched.

**It stays one front, however the text wraps.** The stagger is computed from
each character's position across the block, not its index in the string. On a
heading that wraps, index order would run along line one and then start line
two over at the left — the reveal would jump backwards mid-heading. Position
order keeps it a single front crossing the text, on one line or four.

**The timing is measured to the last letter**, between the first character's
edge and the last one's rather than across the element's box. A centred or
wrapped heading has a box wider than any line in it, so measuring the box would
leave the reveal still running after the text had all arrived.

**Right-to-left text is uncovered from the right.** `sweep: 'auto'` reads the
element's own `direction`, so a Hebrew or Arabic heading is correct without
being told. This was driven in the browser and checked in the DOM, not assumed.

**It respects `prefers-reduced-motion`.** With that setting on the text is
shown in place, immediately, and is never hidden.

**Screen readers get the sentence.** The split spans are hidden from assistive
technology and the original string is attached to the element as its label.
Text waiting for its reveal is hidden visually but never missing from the
accessibility tree.

**It leaves nothing behind.** `destroy()` puts the original text back exactly
as it was.

---

## Limitations, stated plainly

- Lines that mix right-to-left text with Latin or digits can come out in the
  wrong order, because splitting text into characters breaks bidirectional
  reordering. Hebrew or Arabic on its own is correct — that was tested. Mixed
  content is not.
- Resizing the window part-way through a run leaves the rest of that pass
  staggered to the old layout. The finished text is correct and the next run
  re-measures.
- Heavy negative `letter-spacing`, or a font with long swashes, can clip at the
  sides. `from: 'behind'` avoids it — the glyph fades without moving.
- With `trigger: 'view'` the text is hidden until it scrolls into sight. Don't
  use it on anything a reader needs regardless.
- Built for headings. A page of body copy was never a design target.
- Driven in a Chromium engine on macOS, where every state was checked by
  reading the DOM rather than by eye. **It has not been opened in Safari,
  Firefox, Edge, on a phone, in a React app or in WordPress**, and its
  frame-rate behaviour has never been watched — the pane it was driven in
  throttles animation frames. The logic is frame-rate independent by
  construction, but performance was designed for, not measured.
- Hebrew was among the states driven; Arabic was not.

`CHANGELOG.md` keeps the full list.

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

Shutter Type is free because it is one element. The effects unbland sells are
whole scenes — a simulated water surface, a coil of photographs in real 3D, a
field of iron filings following the pointer. Same standard, same documentation,
same one-sentence install.

[unbland.dev](https://unbland.dev)

Questions: see `SUPPORT.txt`.
