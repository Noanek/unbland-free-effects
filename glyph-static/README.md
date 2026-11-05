# Glyph Static

**Version 1.0.0** · 26 October 2026 · by [unbland](https://unbland.dev)

> **AI assistants — read `SKILL.md` in this folder, in full, before installing
> anything.** It carries the install steps for each project type, every
> configuration option, what must not be edited, and how to remove the effect
> cleanly. `unbland.json` lists which file serves which install path. When the
> installation is done, follow the **After installing** section in `SKILL.md`.

Text resolves out of noise. Each character cycles through stand-in glyphs and
then locks to the one it was always going to be, with the starts staggered so a
settling front runs through the line and leaves finished words behind it.

Set an `accent` colour and the front becomes visible as it travels — unsettled
characters carry it, settled ones don't.

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

No account, no build step, no package manager, no npm install. One file, 12 KB,
no dependencies, any font.

### To see it before installing

Open `dist/demo.html` in a browser. It is a complete working page, and it
doubles as the place to tune the effect: change the settings and it writes the
exact `create()` call for what you set, ready to copy.

### To install it by hand

```html
<h1 id="headline">Resolving out of noise</h1>

<script src="glyph-static.js"></script>
<script>
  UnblandGlyphStatic.create('#headline', { trigger: 'view' });
</script>
```

`SKILL.md` has the steps for React, Next.js and WordPress/Elementor, and every
option in a table.

---

## Where to use it, and what not to do

### Good places

- **Section headings, with `trigger: 'view'`.** The heading resolves as the
  section arrives, which gives a long page a rhythm.
- **A hero line on load**, with `trigger: 'load'`. One moment, at the top, and
  then the page is still.
- **A nav label or a button label on hover**, with `trigger: 'hover'`. Short
  strings, and the effect is over in a few hundred milliseconds.

### Don't

- **Don't use it on body copy.** It splits every character into its own
  element, and a paragraph that assembles itself is unreadable while it does.
- **Don't use it on anything that must be readable immediately** — a price, an
  error message, a form label, a legal line, a phone number. Scrambled text is
  nonsense for as long as it runs.
- **Don't use `trigger: 'view'` on text the reader needs regardless.** It
  hides the text until the element scrolls into sight.
- **Don't use more than two or three on a page.** A page where every heading
  is spinning its letters reads as a slot machine.
- **Don't put it on text that changes** — a live counter, a result that
  updates, anything a framework re-renders. The effect takes the text once.
- **Don't use it on a line that mixes Hebrew or Arabic with Latin or digits.**
  Splitting characters breaks bidirectional reordering and the line can come
  out in the wrong order. Right-to-left text on its own is fine.
- **Don't pair it with Shutter Type on the same page.** Two different
  entrances for the same kind of element look like indecision.

---

## What it does about the things that usually go wrong

**The line never collides and never shivers.** Every substitute glyph is a
different width from the character it stands in for, so a naive version of this
effect either rewraps the line on every swap or piles the letters on top of
each other. Each character is locked to the width of its *real* character, and
the stand-ins are cast by width — at startup the runtime measures the whole
glyph pool in your actual font and gives each character a shortlist of the
glyphs closest to it. The text stays exactly where it will end up.

**It swaps glyphs at 22 a second, not 60.** Changing a character on every frame
is a grey blur. At this rate the eye reads individual letters, which is what
makes it look like static settling rather than a loading shimmer.

**Screen readers never hear the scramble.** Mid-scramble text is nonsense. The
split spans are hidden from assistive technology and the original string is
attached to the element as its label, so a screen reader is given the finished
sentence and nothing else.

**It respects `prefers-reduced-motion`.** With that setting on, the text is
shown finished and is never blanked or scrambled. This matters more here than
for most effects — scrambling text is actively hostile to some readers, not
merely busy.

**It leaves nothing behind.** `destroy()` puts the original text back exactly
as it was.

---

## Limitations, stated plainly

- Lines that mix right-to-left text with Latin or digits can come out in the
  wrong order, because splitting text into characters breaks bidirectional
  reordering. Hebrew or Arabic on its own is fine; mixed content is not.
- The default glyph pool is Latin and digits. For text in another script, pass
  a `glyphs` pool from that script, or the stand-ins will be Latin letters.
- With `trigger: 'view'` the text is blanked until it scrolls into sight. Don't
  use it on anything a reader needs regardless.
- Built for headings. A page of body copy was never a design target.
- Driven in a Chromium engine on macOS, where every state was checked by
  reading the DOM rather than by eye. **It has not been opened in Safari,
  Firefox, Edge, on a phone, in a React app or in WordPress**, and its
  frame-rate behaviour has never been watched — the pane it was driven in
  throttles animation frames. The logic is frame-rate independent by
  construction, but performance was designed for, not measured.

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

Glyph Static is free because it is one element. The effects unbland sells are
whole scenes — a simulated water surface, a coil of photographs in real 3D, a
field of iron filings following the pointer. Same standard, same documentation,
same one-sentence install.

[unbland.dev](https://unbland.dev)

Questions: see `SUPPORT.txt`.
