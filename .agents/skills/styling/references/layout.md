# Layout — Regions, Page Surfaces, Borders

## Layout Dimensions

A hardcoded rem dimension on a **layout region** is banned — it doesn't adapt to the container or viewport (`w-56` sidebar, `h-96` panel). Distinguish two cases:

- **Layout region** (sidebar, content pane, column split, page section) → size it responsively, never with a magic rem. Use the Vuetify grid for column layouts (`v-row` / `v-col` with responsive `cols`/`sm`/`md`/`lg` — it is flexbox underneath, so it also drives shells with independent scroll), or UnoCSS `flex-1` + `min-w-0` + responsive direction (`flex-col lg:flex-row`) / breakpoint grids (`grid-cols-1 md:grid-cols-2`). To fill the parent use `h-full` / `size-full` (portable) — not a fixed height.
- **Intrinsic element** (icon, avatar, dot, divider, slider track, meter, media aspect box, dropdown/menu `min-w-*` and readable-content `max-w-*` constraints) → a fixed size IS correct. Prefer the `size` attribute (or `width`/`height` props) over `w-<n>` / `h-<n>` where the component supports it.

```html
<!-- WRONG — magic rem drives the layout -->
<div flex shrink-0 flex-col w-56>…sidebar…</div>
<!-- CORRECT — responsive grid column (flex underneath → scroll still works) -->
<v-row no-gutters>
  <v-col cols="4" md="3" lg="2" pe-6>…sidebar…</v-col>
  <v-col>…content…</v-col>
</v-row>
```

## Vuetify inputs grow to fill a flex column

A Vuetify input's root (`.v-input`) is `flex: 1 1 auto`. Drop it straight into a `flex flex-col` container and it **stretches to the full column height** (a giant text field). Attributify `flex-none` on the component is unreliable — it ties on specificity with Vuetify's base rule and can lose the cascade. Wrap the input in a plain `<div>` instead (default `flex-grow: 0`), so the div is the flex item and the field keeps its natural height:

```html
<!-- CORRECT — wrapper is the flex item; field is its natural height -->
<div>
  <v-text-field density="compact" placeholder="Create role..." />
</div>
```

## Full-Page Surface Layout

`NuxtLayout` renders page content inside `v-main`, which carries the gray `background` base. Page content must **not** sit transparent directly on that base — layer surface on top, Azure-portal style.

- **When the whole page is one surface, paint `v-main` directly instead of adding a wrapper:** `<NuxtLayout :main-style="{ backgroundColor: 'rgb(var(--v-theme-surface))' }">`. No `v-sheet`, no extra div — the docs pages are the reference. Prefer trimming an existing wrapper `v-sheet` down to this whenever it exists only to provide the page background.
- **`bg-surface` on a plain `<div>` is BANNED.** For a distinct nested surface region (a panel inside a page that keeps the gray base) use `v-sheet`/`v-card`, which carry the theme surface inherently. For an element that merely needs an opaque backdrop (e.g. a sticky bar content scrolls under), set `background-color: rgb(var(--v-theme-surface))` in its scoped style — don't wrap it in a component just for colour. (`v-container` is layout/max-width only — it does **not** provide a background.)
- Wrap centered page bodies in `<v-container>` (centered, max-width — **not** `fluid`) inside the `v-sheet`; section titles stay left-aligned.
- Group distinct panels into `v-card` / `StyledCard` (Essentials panels, forms).
- Center a hero/search field with a `flex justify-center` wrapper + a `max-width`, not full-bleed.
- Keep the breadcrumb bar (`StyledPageHeader`) full-width above the surface body.

## Borders drawn exactly once

In multi-box layouts (side-by-side panels, nav + content), each edge must be drawn by **one** component — no two adjacent components both border the shared edge. Give each divider a single owner: the container that spans the whole edge owns it. E.g. a full-height column owns the vertical divider (`b-e`) for the whole row; a header owns its own bottom separator (`b-b`); the box below it stays borderless (no redundant `b-t`).

Prefer keeping shared primitives borderless and letting the consumer supply the border — `StyledDataTableServer` takes only `dataTableServerProps`, so a border comes from the consumer rather than being hard-coded and then opted out of.

## Never restore preset-wind4's border reset

`uno.config.ts` disables it wholesale, and neither half comes back.

A `border-width: 0` matching `*, ::before, ::after` also matches `.v-field__outline__start` and the notch pseudo-elements, where an outlined field's border actually lives — every text field and textarea in the app renders borderless, and layer order does not rescue it however `layers.css` reads. Restoring the `border-style: solid` half instead makes every element that takes a width from a later layer render a border it never declared, Vuetify's loaders and skeletons included. Both have been tried and reverted; the second looks like a tidy way to delete `b-solid` repo-wide and is a regression across the component library.

So **when a Vuetify border looks missing, suspect a global rule reaching into the component before the component.** Variants are already repo-wide in `vuetify.config.ts` — never re-pass `variant="outlined"` at a call site to chase one; it changes nothing (`vuetify` skill, never repeat a global default).

## State-dependent border colour

When error and focus-within are mutually exclusive, put both colours in the `:class` conditional so only the active state's colour class is present — `:class="isError ? ['b-error'] : ['b-border', 'focus-within:b-info']"` — and keep the theme colour as a `b-*` utility rather than a raw rgba arbitrary value.

## Border utilities — the `b-` prefix

Never the Vuetify `border="sm"` prop or `border-sm` class. The `b-{n}` number is the pixel width (`border-sm` → `b-1`, `md` → `b-2`, `lg` → `b-4`, `xl` → `b-8`), and every `border-*` form has a `b-*` counterpart (`b-none`, `b-0`, `b-solid`, `b-t-2`, `b-x-1`).

- **`b-solid` is NOT applied automatically — always add it explicitly with any border-color utility**, and always as a static attribute so it still applies when the colour is dynamic: `<div b-solid b-1 :class="isError ? 'b-error' : 'b-border'">`. For theme-colour borders use `b-text`, `b-border`, `b-info`, `b-error`, `b-transparent`, etc.
- **`b-border` and `rgba(var(--v-border-color), var(--v-border-opacity))` are two colours, not two spellings.** `b-border` is the theme's own `border` colour — one opaque grey, identical in both themes. `--v-border-color` is Vuetify's divider tint: `on-surface` at `--v-border-opacity`, which is what `v-divider` and an outlined `v-card` paint, and which therefore flips with the theme. Rewriting a scoped rule from the second into the first repaints every hairline it touches, so it is never a spelling fix. Chrome we draw ourselves takes `b-border`; a rule that has to line up with a Vuetify divider beside it keeps the tint in a scoped block, because no `b-*` utility spells it.
- **A directional border declares its own zero: `b-0 b-b-1`, never a bare `b-b-1`.** `border-width`'s CSS initial value is `medium` (~3px), so an element carrying `b-solid` paints a 3px frame on every side it gives no explicit width — `b-t-1 b-solid` borders the other three too, reading as unexplained padding. `b-0` first, then the side; UnoCSS emits the shorthand ahead of the longhand, so the pair is order-safe. The same applies inside a `:class` conditional, where the whole set must carry it (`{ 'b-0 b-b-1 b-border b-solid': isBordered }`).

Never reach for a global border reset to fix either of these — see above.

## Sentence-like rows stay in inline flow

A row that reads as one sentence (avatar + "Posted by" + name + timestamp, an inline label with an icon) must stay in **inline flow** — `space-x-{n}` on the container, `align-middle` on the avatar/icon.

Do not use `flex`: every item becomes a shrinkable box, so narrow viewports break each one internally ("Posted / by", "4 minutes / ago" stacked in columns) instead of wrapping mid-sentence like prose.

`flex` is for rows of independent boxes (toolbars, cards, controls) — there each item wrapping as a unit is what you want. `gap-x-*` has no effect in inline flow, which is why this is the one place `space-x-*` is the right utility.
