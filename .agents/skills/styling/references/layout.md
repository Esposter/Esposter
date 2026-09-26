# Layout — Regions, Page Surfaces, Borders

Read when sizing a layout region, laying out a page surface, or putting a border between two of them.

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

## Full-Page Surface Layout

`NuxtLayout` renders page content inside its `main` region, over the page's `background` token. Page content must **not** sit transparent directly on that base — layer surface on top, Azure-portal style.

- **When the whole page is one surface, paint the layout's main region directly instead of adding a wrapper:** `<NuxtLayout :main-style="{ backgroundColor: 'var(--ui-panel)' }">`. No wrapper div exists only to carry the page's background.
- **`bg-panel` on a plain `<div>` is BANNED.** A distinct nested surface region — a panel inside a page that keeps the base — wears the library's `ui-frame`, which draws the style's panel. An element that merely needs an opaque backdrop, such as a sticky bar content scrolls under, sets `background-color: var(--ui-background)` in its scoped style, as the data table's header does — never a component just for colour. The ban is about a `<div>` standing in for a **surface region**; a control whose own fill is part of its design — a picker tile showing `bg-panel` behind an absent image, a chip swapping its fill to read as selected — keeps the utility on the control itself, which is the same carve-out the hover-tint rule states (`references/state-variants.md`).
- Center a page body with `mx-auto` and a readable `max-w-*` inside its frame; section titles stay left-aligned.
- Center a hero/search field with a `flex justify-center` wrapper + a `max-width`, not full-bleed.
- Keep the page header (the `resource` layout's) full-width above the surface body.

## Borders drawn exactly once

In multi-box layouts (side-by-side panels, nav + content), each edge must be drawn by **one** component — no two adjacent components both border the shared edge. Give each divider a single owner: the container that spans the whole edge owns it. E.g. a full-height column owns the vertical divider (`b-e`) for the whole row; a header owns its own bottom separator (`b-b`); the box below it stays borderless (no redundant `b-t`).

Prefer keeping shared primitives borderless and letting the consumer supply the border — a shared table or list shell takes its props through and draws no border of its own, so a border comes from the consumer rather than being hard-coded and then opted out of.

## The border reset is preset-wind4's

`uno.config.ts` keeps preset-wind4's preflight reset, which starts every element and pseudo-element at `border: 0 solid`. So a width utility alone draws a solid border on the sides it names — `b-1`, `b-b-1` — and never needs a `b-solid` or a leading `b-0` beside it. A global border rule of our own is never added on top: the reset already owns the starting point, and a second rule in another layer is what a component would have to fight.

## State-dependent border colour

When error and focus-within are mutually exclusive, put both colours in the `:class` conditional so only the active state's colour class is present — `:class="isError ? ['b-error'] : ['b-border', 'focus-within:b-info']"` — and keep the theme colour as a `b-*` utility rather than a raw rgba arbitrary value.

## Border utilities — the `b-` prefix

The `b-{n}` number is the pixel width, and every `border-*` form has a `b-*` counterpart (`b-none`, `b-0`, `b-t-2`, `b-x-1`). For a token-coloured border use `b-text`, `b-border`, `b-divider`, `b-info`, `b-error`, `b-transparent`, and keep the width a static attribute so it still applies when the colour is dynamic: `<div b-1 :class="isError ? 'b-error' : 'b-border'">`.

- **`b-border` and `b-divider` are two tokens, not two spellings.** The divider is a step fainter than the border in the standard style and the same colour in voxel, and it is what the library's bars and guides draw their lines in. A line between two regions of a surface — a header's rule, a list's separator — takes the divider; the edge of a control takes the border. Swapping one for the other repaints every line it touches, so it is never a spelling fix.

## Sentence-like rows stay in inline flow

A row that reads as one sentence (avatar + "Posted by" + name + timestamp, an inline label with an icon) must stay in **inline flow** — `space-x-{n}` on the container, `align-middle` on the avatar/icon.

Do not use `flex`: every item becomes a shrinkable box, so narrow viewports break each one internally ("Posted / by", "4 minutes / ago" stacked in columns) instead of wrapping mid-sentence like prose.

`flex` is for rows of independent boxes (toolbars, cards, controls) — there each item wrapping as a unit is what you want. `gap-x-*` has no effect in inline flow, which is why this is the one place `space-x-*` is the right utility.
