# Borders

Read when drawing a border, putting one between two regions, or finding a border you did not ask for.

## Borders drawn exactly once

In multi-box layouts (side-by-side panels, nav + content), each edge must be drawn by **one** component — no two adjacent components both border the shared edge. Give each divider a single owner: the container that spans the whole edge owns it. E.g. a full-height column owns the vertical divider (`b-e`) for the whole row; a header owns its own bottom separator (`b-b`); the box below it stays borderless (no redundant `b-t`).

Prefer keeping shared primitives borderless and letting the consumer supply the border — a shared table or list shell takes its props through and draws no border of its own, so a border comes from the consumer rather than being hard-coded and then opted out of.

## The border reset is preset-wind4's

`apps/web/uno.config.ts` keeps preset-wind4's preflight reset, which starts every element and pseudo-element at `border: 0 solid`. So a width utility alone draws a solid border on the sides it names — `b-1`, `b-b-1` — and never needs a `b-solid` or a leading `b-0` beside it. A global border rule of our own is never added on top: the reset already owns the starting point, and a second rule in another layer is what a component would have to fight.

## State-dependent border colour

When error and focus-within are mutually exclusive, put both colours in the `:class` conditional so only the active state's colour class is present — `:class="isError ? ['b-error'] : ['b-border', 'focus-within:b-info']"` — and keep the theme colour as a `b-*` utility rather than a raw rgba arbitrary value.

## Border utilities — the `b-` prefix

The `b-{n}` number is the pixel width, and every `border-*` form has a `b-*` counterpart (`b-none`, `b-0`, `b-t-2`, `b-x-1`). For a token-coloured border use `b-text`, `b-border`, `b-divider`, `b-info`, `b-error`, `b-transparent`, and keep the width a static attribute so it still applies when the colour is dynamic: `<div b-1 :class="isError ? 'b-error' : 'b-border'">`.

- **`b-border` and `b-divider` are two tokens, not two spellings.** The divider is a step fainter than the border in the standard style and the same colour in voxel, and it is what the library's bars and guides draw their lines in. A line between two regions of a surface — a header's rule, a list's separator — takes the divider; the edge of a control takes the border. Swapping one for the other repaints every line it touches, so it is never a spelling fix.
