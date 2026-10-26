# Layout — Regions, Page Surfaces, Flow

Read when sizing a layout region, laying out a page surface, or building a row that reads as one sentence.

## Layout Dimensions

A hardcoded rem dimension on a **layout region** is banned — it doesn't adapt to the container or viewport (`w-56` sidebar, `h-96` panel). Distinguish two cases:

- **Layout region** (sidebar, content pane, column split, page section) → size it responsively, never with a magic rem. Use UnoCSS `flex-1` + `min-w-0` + responsive direction (`flex-col lg:flex-row`) or breakpoint grids (`cols-1 md:cols-2`). To fill the parent use `h-full` / `size-full` (portable) — not a fixed height.
- **Intrinsic element** (icon, avatar, dot, divider, slider track, meter, media aspect box, dropdown/menu `min-w-*` and readable-content `max-w-*` constraints) → a fixed size IS correct. Prefer the `size` attribute (or `width`/`height` props) over `w-<n>` / `h-<n>` where the component supports it.

```html
<!-- WRONG — magic rem drives the layout -->
<div flex shrink-0 flex-col w-56>…sidebar…</div>
<!-- CORRECT — the column takes its share of the row and the content the rest -->
<div grid cols-1 lg:cols-4>
  <div pe-6>…sidebar…</div>
  <div lg:col-span-3 min-w-0>…content…</div>
</div>
```

## Page Surfaces

**A page never paints a background of its own** — it sits on the ground `body` paints, and which part draws every other surface is `openspec/specs/architecture/page-layout/design.md`. A list that seems to want a panel behind the whole page belongs in a drawer.

- **`bg-panel` on a plain `<div>` is banned.** A `<div>` standing in for a surface region wears the library's `ui-frame`, which draws the style's panel. An element that merely needs an opaque backdrop, such as a sticky bar content scrolls under, sets `background-color: var(--ui-background)` in its scoped style, as the data table's header does — never a component just for colour. A control whose own fill is part of its design — a picker tile showing `bg-panel` behind an absent image, a chip swapping its fill to read as selected — keeps the utility on the control itself, which is the same carve-out the hover-tint rule states (`references/state-variants.md`).
- **A page uses its full width** — a readable measure holds running prose alone (the `ui-library` skill, `references/design-pass.md`); a hero or search field is centred with a `flex justify-center` wrapper and a `max-width`, not full-bleed.

## Sentence-like rows stay in inline flow

A row that reads as one sentence (avatar + "Posted by" + name + timestamp, an inline label with an icon) must stay in **inline flow** — `space-x-{n}` on the container, `align-middle` on the avatar/icon.

Do not use `flex`: every item becomes a shrinkable box, so narrow viewports break each one internally ("Posted / by", "4 minutes / ago" stacked in columns) instead of wrapping mid-sentence like prose.

`flex` is for rows of independent boxes (toolbars, cards, controls) — there each item wrapping as a unit is what you want. `gap-*` has no effect in inline flow, which is why this is the one place `space-x-*` is the right utility.
