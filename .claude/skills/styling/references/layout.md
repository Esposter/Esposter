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
  <v-text-field density="compact" hide-details placeholder="Create role..." />
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
