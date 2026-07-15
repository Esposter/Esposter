---
name: styling
description: Esposter UnoCSS Attributify Mode styling conventions — prop-based attributes for all static styles, class only for scoped CSS refs / dynamic bindings / third-party selectors, layout dimensions (no magic rem on regions; Vuetify grid, flex-1), full-page surface layout (v-sheet over bg-surface) and borders drawn exactly once, slash/fraction utilities, theme colours and text-info links, arbitrary values and CSS variables, abbreviated utilities (op-, b-, rd-), gap directionality, the parent owning spacing (gap/padding over child margins), rem over px, and style-block rules. Apply when writing or reviewing styles in .vue or .scss files, or laying out a page, panel, sidebar, or border.
---

# Styling — UnoCSS Attributify Mode (MANDATORY)

- Prop-based styling for ALL static styles: `<div text-red p-4>`.
- **UnoCSS attributes go first** — before Vue/component props: `<StyledAvatar flex-none :image="image" :name="name" />`.
- `flex` not `d-flex`.
- `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible.
- Prefer simple named utilities over arbitrary values. Avoid arbitrary shadows, gradients, dimensions, border widths, and z-index unless the layout needs them. Don't add z-index defensively; rely on DOM order and positioning first.
- Prefer theme primitives over bespoke styling: `StyledCard` / `v-sheet` for card/panel/surface backgrounds; theme colours (`bg-background`, `b-border`, `text-primary`, `text-error`) and semantic opacity utilities before custom colours. For surface colour use `v-sheet`, not `bg-surface` on a `<div>` (see Full-Page Surface Layout).
- Avoid arbitrary hex/RGB/RGBA, custom shadows, and one-off background/border colours in app UI. If a semantic colour is genuinely needed, prefer Vuetify theme colours or the Material palette with lighten/darken variants (`text-green-darken-2`, `bg-yellow-lighten-5`, `text-red`) over raw values.
- Never hardcode a fixed dimension to lay out a **region** (sidebar/panel/column split) — see [Layout Dimensions](#layout-dimensions).
- Arbitrary dimensions are a last resort for true format constraints (`aspect-video`, viewport-safe containers, canvas/game surfaces, third-party embeds). First check whether the component hierarchy or flex/grid structure is wrong.

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

### Vuetify inputs grow to fill a flex column

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

### Borders drawn exactly once

In multi-box layouts (side-by-side panels, nav + content), each edge must be drawn by **one** component — no two adjacent components both border the shared edge. Give each divider a single owner: the container that spans the whole edge owns it. E.g. a full-height column owns the vertical divider (`b-e`) for the whole row; a header owns its own bottom separator (`b-b`); the box below it stays borderless (no redundant `b-t`).

Prefer keeping shared primitives borderless and letting the consumer supply the border — `StyledDataTableServer` takes only `dataTableServerProps`, so a border comes from the consumer rather than being hard-coded and then opted out of.

## Slashes / fractions → valued attributify (never bare, never `class`)

A utility containing `/` (fractions like `top-1/2`, `translate-y-1/2`) **cannot** be a bare attribute — the SFC/prettier parser reads the `/` as a tag terminator and fails (`Opening tag "div" not terminated`). It also must **not** be dumped into `class="..."` to dodge the parser. Use the **valued** attributify form `attr="value"`, and for negatives put the `-` in front of the number, inside the quotes:

```html
<!-- WRONG — bare slash breaks the parser -->
<div top-1/2 translate-y-1/2 />
<!-- WRONG — utilities crammed into class -->
<div class="top-1/2 -translate-y-1/2" />
<!-- CORRECT — valued attributify; negative prefixes the number inside the quotes -->
<div top="1/2" translate-y="-1/2" translate-x="-1/2" />
```

This is the valued analogue of the bare-scale negative rule (`top--1`) below: the minus always prefixes the number, never the attribute name.

## What stays in `class="..."`

Only when technically required:

- **Scoped CSS refs** — class names referenced in `<style scoped>` (e.g. `class="card"`)
- **Dynamic bindings** — `:class="..."` always stays as-is
- **Third-party component classes** — e.g. `vue-flow__panel`, `v-window__controls`, `fc-event-title`, Vuetify internal `v-`-prefixed classes (e.g. `v-theme--light`)
- **SVG classes** — e.g. `fclass1`, `a`, `b`
- **`group`** — UnoCSS group variant token; must stay in `class` so descendant `group-hover:` variants work

## What can be attributify (including Vuetify utilities)

`presetAttributify()` is active in `uno.config.ts`, so ALL of these work as standalone attributify attributes:

- Vuetify MD3 typography: `text-title-large`, `text-headline-small`, `text-body-large`, `text-body-small`, etc. Do not use MD2 utilities like `text-caption`; use the MD3 equivalent (`text-body-small`).
- Vuetify theme colours: `bg-surface`, `bg-background`, `bg-border`, `text-error`, `text-info`, etc.
- Opacity emphasis: use `op-medium-emphasis` / `op-high-emphasis`, not `text-medium-emphasis`.
- Custom theme colours: `bg-surface-opacity-80`, `bg-background-opacity-40`, etc.
- Material Design palette: `text-amber`, `bg-deep-purple`, `text-yellow-darken-4`, etc.

### Color utility availability

Only registered colors generate utilities — don't assume a Vuetify default theme colour works: use `text-primary` not `text-success`, `bg-surface` not `bg-surface-variant`. Registration rules (theme colours, palette, safelisting) live in the `unocss` skill.

### Links use `text-info` (the blue), never `text-primary`

Hyperlinks / clickable inline text get `text-info` — that is the conventional link blue. `text-primary` is the brand/action accent, not a link colour. Applies to `<a>`, `NuxtLink`, and any inline "click here" affordance.

```html
<!-- WRONG --><a text-primary @click="...">grant access</a>
<!-- CORRECT --><a cursor-pointer text-info underline @click="...">grant access</a>
```

When reading hyphenated theme colours from `useColorsStore()`, destructure quoted keys and alias to camel-case:

```ts
const { "background-opacity-40": backgroundOpacity40 } = storeToRefs(colorsStore);
```

## `v-bind(themeColor)` in CSS → attributify

When a scoped CSS class exists _only_ to set a Vuetify theme colour with `v-bind()`, convert to attributify and delete the class (also remove the `storeToRefs` destructure, and `useColorsStore()` if nothing else uses it):

```diff
- <StyledCard class="card">
+ <StyledCard bg-surface-opacity-80>

- <style scoped lang="scss">
- .card { background-color: v-bind(surfaceOpacityColor); }
- </style>
```

### Hover state → `hover:utility`

`&:hover { color: v-bind(primary-darken-1); }` migrates to a standalone `hover:text-primary-darken-1`:

```diff
- <NuxtInvisibleLink class="author" ...>
+ <NuxtInvisibleLink text-primary hover:text-primary-darken-1 transition-colors duration-[--transition-duration] ...>
```

Colons inside attribute names (`hover:text-primary-darken-1`) are valid in Vue templates — only a leading `:` triggers `v-bind`.

**Do NOT convert** when `v-bind` appears in:

- Structural pseudo-selectors: `:nth-of-type`, `:nth-child`, `:not()`, `:first-of-type`
- `:deep()` rules
- Complex shorthand properties with non-colour reactive values (`animation: ... v-bind(dur)`, `transform: ... v-bind(x)`)
- Non-colour reactive values (`transform`, `top`, `left`, `height`, `fill`, `stroke`)
- Element/tag selectors (`p`, `a`, `ul`, `li`)

## `!important` Variant

Append `!` inside the attribute value to generate `!important`. Use only when overriding third-party styles that can't be targeted otherwise:

```html
<!-- top: var(--app-bar-height) !important; z-index: 1500 !important -->
<NuxtLoadingIndicator top="[--app-bar-height]!" z="[1500]!" />
```

## `field-sizing-content`

Replaces `field-sizing: content` in scoped CSS — use directly as an attribute on `<input>` / `<textarea>`:

```diff
- <input class="input" ... />
+ <input field-sizing-content ... />

- <style scoped>
- .input { field-sizing: content; }
- </style>
```

## Arbitrary CSS Values

Use UnoCSS square-bracket syntax for arbitrary values — including `calc()` and CSS variable references — directly as props:

```html
<!-- Instead of scoped .sidebar { top: calc(1rem + var(--app-bar-height)) } -->
<UserSideBar sticky top="[calc(1rem+--app-bar-height)]" />
<div h="[calc(100dvh_-_--app-bar-height)]" overflow-y-auto />
<div bg="[#f0f0f0]" />
```

Spaces inside `calc()` must be omitted or replaced with `_`: `calc(1rem+--x)` not `calc(1rem + var(--x))`.

### CSS Variables in Arbitrary Values

**Prefer the bare `--variable` shorthand inside UnoCSS arbitrary value brackets** — UnoCSS auto-wraps `--variable` names with `var()`:

```html
<!-- Prefer — bare --variable shorthand -->
<div duration="[--transition-duration]" />
<div top="[--app-bar-height]!" />
<div shadow="[0_0_5px_rgb(--v-theme-primary-lighten-1)]" />
<!-- Valid but verbose — use the shorthand for single variables -->
<div duration="[var(--transition-duration)]" />
```

`var()` inside brackets is not an error — it's the natural form for composite values like `b="[rgba(var(--v-border-color),var(--v-border-opacity))]"`. Just prefer the shorthand for the simple single-variable case.

Exception: `var()` inside `<style scoped>` blocks and `:style` binding objects stays as-is. When converting a scoped class that only contains arbitrary-value properties, delete the class name and the `<style scoped>` block entirely.

## Transition Splitting

Split the CSS `transition` shorthand into separate UnoCSS attributes — one for property, one for duration:

```html
<!-- Single property + CSS-variable duration -->
<NuxtInvisibleLink transition-colors duration-[--transition-duration] ...>
  <!-- Multi-property with same static duration: single arbitrary value -->
  <button transition="[box-shadow_0.2s,transform_0.2s]" ...></button
></NuxtInvisibleLink>
```

Rules:

- Single known property → UnoCSS shorthand (`transition-colors`, `transition-shadow`, `transition-transform`, `transition-opacity`, etc.)
- Override default duration with a separate `duration-{n}` or `duration-[--x]` (no `var()` wrapper)
- Multi-property transitions (e.g. `box-shadow` + `transform`) must stay a single `transition="[...]"` arbitrary value — splitting them makes the second `transition-property` override the first
- Spaces in arbitrary `transition` values become `_`

## Abbreviated Utilities

Always use UnoCSS abbreviated shorthand forms — they are first-class utilities.

**Opacity (`op-` prefix):**

- `op-0`/`op-50`/`op-100` not `opacity-*`
- Works with variants: `group-hover:op-100`, `hover:op-80`, `disabled:op-30`
- Prefer semantic utilities for non-obvious values: `op-medium-emphasis` → `var(--v-medium-emphasis-opacity)`, `op-high-emphasis` → `var(--v-high-emphasis-opacity)` (defining/safelisting new ones — see the `unocss` skill)
- Use boolean bindings for conditional semantic opacity utilities:

  ```html
  <button :op-loading="isLoading ? '' : undefined" :op-high-emphasis="!isLoading && !isHovering ? '' : undefined" />
  ```

- Reserve raw numeric opacity for obvious visibility states (`0`, `0!`, `op-0`, `op-100`, `group-hover:op-100`). Avoid raw non-obvious values (`op-40`, `op-50`, `:op="80"`) in app UI; use semantic utilities or CSS variables.

**Spacing/position scale values:**

- Use UnoCSS scale tokens instead of explicit rem when the value is on the spacing scale (`1` = `0.25rem`, `2` = `0.5rem`, etc.).
- For negative values, put the double hyphen in the attribute name: `right--1`, `top--1`, `ml--2`. Do not write `right="-0.25rem"` or use `-right-1` in templates.
- Use arbitrary values only when off-scale or computed, e.g. `top="[calc(100dvh_-_--app-bar-height)]"`.

**Border (`b-` prefix)** — never the Vuetify `border="sm"` prop or `border-sm` class. The `b-{n}` number is the pixel width (`border-sm` → `b-1`, `md` → `b-2`, `lg` → `b-4`, `xl` → `b-8`), and every `border-*` form has a `b-*` counterpart (`b-none`, `b-0`, `b-solid`, `b-t-2`, `b-x-1`).

**`b-solid` is NOT applied automatically — always add it explicitly with any border-color utility.** For theme-colour borders use `b-text`, `b-border`, `b-info`, `b-error`, `b-transparent`, etc.

**Border-color + border-style must always appear together** — including in dynamic `:class` (put `b-solid` as a static attribute):

```html
<!-- WRONG — won't render without b-solid -->
<div b-1 b-text>
  <!-- CORRECT -->
  <div b-solid b-1 b-text>
    <!-- CORRECT — dynamic color, static style -->
    <div b-solid b-1 :class="isError ? 'b-error' : 'b-border'"></div>
  </div>
</div>
```

**`custom-border` / `border-color` scoped-class pattern → attributify:**

```diff
- <div class="custom-border" ...>
+ <div b-solid b-1 b-text ...>

- <style scoped>
- .custom-border { border: var(--border-width) var(--border-style) v-bind(text); }
- </style>
```

`--border-width: thin` = 1px → `b-1`. `--border-style: solid` → `b-solid` (explicit, not automatic). The theme colour becomes the `b-*` suffix.

**BEM border class with focus/error variants** — when error and focus-within are mutually exclusive, put both colours in the `:class` conditional so only the active state's colour class is present, and keep the theme colour as a `b-*` utility rather than a raw rgba arbitrary value. Shipped example: `Message/Model/Message/Input/SlashCommandParameters/Chip.vue` (no `<style>` block at all):

```vue
<div
  :class="isError ? ['b-error'] : ['b-border', 'focus-within:b-info']"
  b="[0.09375rem]"
  px-2
  py-1
  rd
  b-solid
  bg-border
  inline-flex
  gap-1.5
  items-center
  overflow-hidden
>
```

**Border-radius (`rd` prefix)** — never the Vuetify `rounded="sm"` prop or `rounded-sm` class: `rd` not `rounded`, `rd-t-2` not `rounded-t-2`, `rd-full` not `rounded-full`. Two mappings aren't a direct rename — Vuetify `rounded-xl` is `rd-3xl` (24px), and `rounded-circle` is `rd="50%"`.

**Background:** `bg-transparent` not `background-transparent`. **Outline:** `outline-none` not `outline-0` (sets `outline: 2px solid transparent`).

When in doubt, prefer the shorter form — UnoCSS abbreviations are canonical here.

## Named Utilities Over Numeric

Prefer UnoCSS **named** utilities over numeric equivalents whenever a name exists:

- Font weight: `font-medium` / `font-semibold` / `font-bold` — never `font-500` / `font-600` / `font-700`.
- Transition duration: `duration-[--transition-duration]` (the global variable from `globals.scss`) — never a raw `duration-200`.
- Vuetify helper classes (`font-weight-medium`, `font-weight-bold`, …) are **not** UnoCSS utilities — as attributify attributes they generate nothing. Only the shortcuts registered in `uno.config.ts` work (MD3 typography `text-body-small` etc., theme/palette colours, semantic opacity). Use the UnoCSS named form (`font-medium`) instead.

## Gap Directionality

Use axis-specific gap utilities instead of omnidirectional `gap-{n}`:

- **`flex` (row)** → `gap-x-{n}` (columns only)
- **`flex-col`** → `gap-y-{n}` (rows only)
- **`grid` / 2D layouts** → `gap-{n}` (both axes intentional)

```html
<div flex gap-x-2>...</div>
<div flex flex-col gap-y-1>...</div>
<div grid grid-cols-3 gap-4>...</div>
```

## The Parent Owns Spacing

Space between siblings belongs to the container, as `gap-*`. Space inside a boundary belongs to that boundary, as `padding`. A child should not carry a margin to position itself against its siblings — it can't know what it sits next to, so the same margin gets re-solved in every component that renders it.

```html
<!-- Bad: each child hardcodes the rhythm, and the last one leaves a stray gap -->
<div flex flex-col>
  <SomeTitle mb-3 />
  <SomeList mt-2 />
</div>

<!-- Good: the container states the rhythm once -->
<div flex flex-col gap-y-3>
  <SomeTitle />
  <SomeList />
</div>
```

Three reliable signals that a margin is in the wrong place:

- **A reset undoing a default** (`mb-0`, `class="m-0"`) — the child is fighting spacing it should never have had. Fix the owner, don't stack a counter-margin.
- **A negative margin** (`ml--2`, `my--1`) — the parent's padding and the child's margin are fighting; one of them is wrong.
- **The same margin in sibling files** (`<v-icon mr-2 />` repeated across rows) — that's one gap the row should own, not N margins.

Margin stays correct for a few things: pushing an element within an already-`gap`-ed row (`ma-auto`, `mt-auto`), and off-scale nudges that aren't sibling rhythm at all — though reach for `absolute` first (see below).

When converting a child margin to a parent `gap`, check the trailing edge: a `mb-*` on every child also pads _below the last one_, which `gap-y-*` deliberately does not. If that trailing space was load-bearing (scroll breathing room), move it to the container's `padding`, don't reintroduce the margin.

## Absolute Positioning Within a Container

Use `relative` on the parent and `absolute top-0 right-0` (or other corners) to pin UI elements. Prefer this over manual margin/padding tricks when an element should float independent of sibling flow:

```html
<div bg-background relative h-20>
  <div absolute top-0 right-0 flex gap-x-1 p-1>
    <slot name="actions" />
  </div>
</div>
```

## Units

- **Always use `rem` instead of `px`** for all CSS values (font sizes, spacing, widths, heights, borders, etc.).

## Style Block

- Use `<style scoped>` — `scoped` always required.
- Omit `lang="scss"` unless the block uses Sass features (variables, nesting, mixins). Plain CSS doesn't need it.
- **Switch to `lang="scss"` the moment nesting simplifies the block** — e.g. many `:deep(...)` rules repeating one root selector (`.docs-content :deep(h1)`, `.docs-content :deep(h2)`, …) collapse to one nested root (`.docs-content { :deep(h1) {…} }`). If a plain-CSS block repeats an ancestor selector 3+ times, refactor it to nested SCSS; conversely never add `lang="scss"` to a block that stays flat.
