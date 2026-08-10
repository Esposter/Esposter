---
name: styling
description: Esposter UnoCSS Attributify Mode styling conventions — prop-based attributes for all static styles, class only for scoped CSS refs / dynamic bindings / third-party selectors, theme primitives and theme colours over bespoke values, the full MD3 typography set and semantic opacity in place of a fixed text-gray, text-info links, state variants (hover:/focus-within:) instead of scoped &:hover blocks, slash/fraction utilities in valued attributify, abbreviated utilities (op-, b-, rd-) with the explicit b-solid rule and the per-element `b-0` a directional border needs (never a global border-width reset, which erases every Vuetify input's outline), named over numeric utilities, gap directionality, sentence-like rows staying in inline flow, the parent owning spacing (gap/padding over child margins), absolute positioning within a container, rem over px including Vuetify size/width/height props and `:root` tokens with the four narrow px exceptions (JS-synced values, SVG user space, HTML email, vendored snapshots), and style-block rules, plus deep dives on page/panel/sidebar/region layout with border ownership and on arbitrary bracket values (calc, CSS variables, transitions, !important). Apply when writing or reviewing styles in .vue or .scss files, or laying out a page, panel, sidebar, or border.
---

# Styling — UnoCSS Attributify Mode (MANDATORY)

## Deep Dives

- `references/layout.md` — when laying out a page, panel, sidebar or column split, sizing a region, or deciding which component draws a shared border.
- `references/arbitrary-values.md` — when a utility needs an arbitrary `[...]` value: `calc()`, a CSS variable, a transition, or `!important`.

## Core Rules

- Prop-based styling for ALL static styles: `<div text-red p-4>`. Where UnoCSS attributes sit relative to component props is the `vue` skill's template attribute order.
- `flex` not `d-flex`.
- `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible. **A Vuetify `size`/`width`/`height` prop is an authored length, so it takes `rem`** — `size="4rem"`, never `size="64"`. Vuetify appends `px` to a bare number, which is exactly the unit the rem rule below exists to keep out; the props accept any CSS length string, so there is nothing to trade away.
- Prefer simple named utilities over arbitrary values. Avoid arbitrary shadows, gradients, dimensions, border widths, and z-index unless the layout needs them. Don't add z-index defensively; rely on DOM order and positioning first.
- Prefer theme primitives over bespoke styling: `StyledCard` / `v-sheet` for card/panel/surface backgrounds; theme colours (`bg-background`, `b-border`, `text-primary`, `text-error`) and semantic opacity utilities before custom colours. For surface colour use `v-sheet`, not `bg-surface` on a `<div>` (`references/layout.md`).
- Avoid arbitrary hex/RGB/RGBA, custom shadows, and one-off background/border colours in app UI. If a semantic colour is genuinely needed, prefer Vuetify theme colours or the Material palette with lighten/darken variants (`text-green-darken-2`, `bg-yellow-lighten-5`, `text-red`) over raw values.
- Never hardcode a fixed dimension to lay out a **region** (sidebar/panel/column split) — `references/layout.md`. Arbitrary dimensions are a last resort for true format constraints (`aspect-video`, viewport-safe containers, canvas/game surfaces, third-party embeds); first check whether the component hierarchy or flex/grid structure is wrong.
- **Always `rem`, never `px`** for every authored CSS length — style blocks, and arbitrary `[...]` values (font sizes, spacing, widths, heights, borders) — and `:root` custom properties in `globals.scss` and inline style objects with them. Documented UnoCSS utilities keep their canonical form: scale tokens (`p-4`, `top--1`) and `b-{n}` widths are utility names, not authored lengths. A length of zero carries no unit at all — `bottom: "0"`, never `"0px"`.
  - **`px` survives only where the unit is not ours to choose**, and each case is narrow enough to name: a value that has to stay numerically in step with a JS-side API (Vuetify's `$grid-breakpoints` against `useDisplay().thresholds`, a drawer width that is also a `v-navigation-drawer :width` number); an SVG presentation attribute or a `<foreignObject>` child, which is in user-space units rather than CSS lengths; markup for HTML email, where `rem` support is unreliable; and vendored output mirrored into a snapshot. Everything else is authored, and everything authored is `rem`.
  - A round `px` value that is already a token is a duplicated constant before it is a unit problem — `borderRadius: "4px 0 0 4px"` wants `var(--border-radius)`, not `"0.25rem"`.
- `field-sizing: content` is an attributify utility — put `field-sizing-content` directly on the `<input>` / `<textarea>`, never in a scoped class.

## Slashes / fractions → valued attributify (never bare, never `class`)

A utility containing `/` (`top-1/2`, `translate-y-1/2`) **cannot** be a bare attribute — the SFC/prettier parser reads the `/` as a tag terminator and fails (`Opening tag "div" not terminated`). It also must **not** be dumped into `class="..."` to dodge the parser. Use the **valued** form with the minus inside the quotes, prefixing the number: `<div top="1/2" translate-y="-1/2" translate-x="-1/2" />`. This is the valued analogue of the bare-scale negative rule (`top--1`) below.

## What stays in `class="..."`

Only when technically required:

- **Scoped CSS refs** — class names referenced in `<style scoped>` (e.g. `class="card"`)
- **Dynamic bindings** — `:class="..."` always stays as-is
- **Third-party component classes** — e.g. `vue-flow__panel`, `v-window__controls`, `fc-event-title`, Vuetify internal `v-`-prefixed classes (e.g. `v-theme--light`)
- **SVG classes** — e.g. `fclass1`, `a`, `b`
- **`group`** — UnoCSS group variant token; must stay in `class` so descendant `group-hover:` variants work

A scoped class (with `v-bind()` for reactive values) also stays correct where attributify cannot reach: structural pseudo-selectors (`:nth-child`, `:not()`, `:first-of-type`), `:deep()` rules, bare element/tag selectors, and non-colour reactive values (`transform`, `top`, `height`, `fill`, `animation`). Everything else — a class that only sets a theme colour, a hover colour, or arbitrary-value properties — is an attribute.

## What can be attributify (including Vuetify utilities)

`presetAttributify()` is active in `uno.config.ts`, so ALL of these work as standalone attributify attributes:

- Vuetify MD3 typography: **every** role in `typographyPresets.md3` is registered as a shortcut, kebab-cased — the five scales (`display`, `headline`, `title`, `body`, `label`) crossed with `large`/`medium`/`small`, so `text-label-medium` and `text-display-large` are as available as `text-body-small`. `uno.config.ts` generates them from the preset rather than listing them, so there is no shorter allowlist to check against. Do not use MD2 utilities like `text-caption`; use the MD3 equivalent (`text-body-small`).
- Vuetify theme colours: `bg-surface`, `bg-background`, `bg-border`, `text-error`, `text-info`, etc.
- Opacity emphasis: use `op-medium-emphasis` / `op-high-emphasis`, not `text-medium-emphasis`. **De-emphasised text is an emphasis opacity, never a grey.** `text-gray` resolves against preset-wind4's own palette, not the Vuetify theme, so it paints the same fixed grey in dark mode as in light and drifts out of contrast in one of them. `op-medium-emphasis` is `var(--v-medium-emphasis-opacity)` over the current text colour, so it follows the theme by construction. Where the text is also `text-body-small` — captions, timestamps, hints — the pair already has a name: the `text-hint` shortcut.
- Custom theme colours: `bg-surface-opacity-80`, `bg-background-opacity-40`, etc.
- Material Design palette: `text-amber`, `bg-deep-purple`, `text-yellow-darken-4`, etc.

Only registered colors generate utilities — don't assume a Vuetify default theme colour works: use `text-primary` not `text-success`, `bg-surface` not `bg-surface-variant`. Registration rules (theme colours, palette, safelisting) live in the `unocss` skill. When reading hyphenated theme colours from a colours store, destructure quoted keys and alias to camel-case: `const { "hyphenated-key": hyphenatedKey } = storeToRefs(colorsStore);`.

### Links use `text-info` (the blue), never `text-primary`

Hyperlinks / clickable inline text get `text-info` — that is the conventional link blue. `text-primary` is the brand/action accent, not a link colour. Applies to `<a>`, `NuxtLink`, and any inline "click here" affordance: `<a cursor-pointer text-info underline @click="…">grant access</a>`.

### State variants are utilities, not `&:hover` blocks

A colour that changes on hover/focus/disabled is a variant utility (`hover:text-primary-darken-1`, `focus-within:b-info`, `disabled:op-30`), never a scoped `&:hover` rule. Colons inside attribute names are valid in Vue templates — only a **leading** `:` triggers `v-bind`.

**A hover or active background is `hover:bg-hover` / `bg-activated`, never a hand-picked surface colour.** Those two utilities are Vuetify's own interaction tints, defined in `uno.config.ts` from the same `calc(var(--v-<state>-opacity) * var(--v-theme-overlay-multiplier))` formula `VBtn` uses, so a custom affordance lands on exactly the colour a button does in both themes and follows the theme when those variables move. Picking `hover:bg-surface` instead makes a control that is a shade off every real button beside it, and the drift is invisible until the two sit together.

This is for a **state tint over whatever is underneath**. A control whose background is itself the design — a chip that swaps its own fill to read as selected — keeps its explicit colour; the tint is an overlay, not a palette.

## Abbreviated Utilities

Always use the UnoCSS abbreviated shorthand forms — they are first-class utilities, and when in doubt the shorter form is canonical here.

**Opacity (`op-` prefix):**

- `op-0`/`op-50`/`op-100` not `opacity-*`; works with variants (`group-hover:op-100`, `hover:op-80`, `disabled:op-30`).
- Prefer semantic utilities for non-obvious values: `op-medium-emphasis` → `var(--v-medium-emphasis-opacity)`, `op-high-emphasis` → `var(--v-high-emphasis-opacity)` (defining/safelisting new ones — see the `unocss` skill).
- Conditional semantic opacity utilities take boolean bindings: `:op-high-emphasis="!isLoading ? '' : undefined"`.
- Reserve raw numeric opacity for obvious visibility states (`0`, `0!`, `op-0`, `op-100`, `group-hover:op-100`). Avoid raw non-obvious values (`op-40`, `op-50`, `:op="80"`) in app UI; use semantic utilities or CSS variables.

**Spacing/position scale values:**

- Use UnoCSS scale tokens instead of explicit rem when the value is on the spacing scale (`1` = `0.25rem`, `2` = `0.5rem`, etc.).
- For negative values, put the double hyphen in the attribute name: `right--1`, `top--1`, `ml--2`. Do not write `right="-0.25rem"` or use `-right-1` in templates.
- Use arbitrary values only when off-scale or computed (`references/arbitrary-values.md`).

**Border (`b-` prefix)** — never the Vuetify `border="sm"` prop or `border-sm` class. The `b-{n}` number is the pixel width (`border-sm` → `b-1`, `md` → `b-2`, `lg` → `b-4`, `xl` → `b-8`), and every `border-*` form has a `b-*` counterpart (`b-none`, `b-0`, `b-solid`, `b-t-2`, `b-x-1`).

- **`b-solid` is NOT applied automatically — always add it explicitly with any border-color utility**, and always as a static attribute so it still applies when the colour is dynamic: `<div b-solid b-1 :class="isError ? 'b-error' : 'b-border'">`. For theme-colour borders use `b-text`, `b-border`, `b-info`, `b-error`, `b-transparent`, etc.
- **A directional border declares its own zero: `b-0 b-b-1`, never a bare `b-b-1`.** `border-width`'s CSS initial value is `medium` (~3px), so an element carrying `b-solid` paints a 3px frame on every side it gives no explicit width — `b-t-1 b-solid` borders the other three too, reading as unexplained padding. `b-0` first, then the side; UnoCSS emits the shorthand ahead of the longhand, so the pair is order-safe. The same applies inside a `:class` conditional, where the whole set must carry it (`{ 'b-0 b-b-1 b-border b-solid': isBordered }`).
- **Never fix that with a global `border-width: 0` reset — it makes every Vuetify input invisible.** A reset matching `*, ::before, ::after` also matches `.v-field__outline__start` and the notch pseudo-elements, which is where an outlined field's border actually lives, so every text field and textarea in the app renders borderless. Layer order does not rescue it in practice however `layers.css` reads: it was tried, shipped, and traced back from "the biography field has no border". Keep `uno.config.ts` disabling preset-wind4's reset wholesale and do not restore either half of it.
  - Restoring the `border-style: solid` half is the other trap: **every** element that takes a width from a later layer without declaring a style of its own suddenly renders one — Vuetify's loaders and skeletons among them. It looks like a tidy way to delete `b-solid` repo-wide; it is a visual regression across the component library. Tried and reverted.
  - So when a Vuetify border looks missing, suspect a global rule reaching into the component before suspecting the component. Variants are already set repo-wide in `vuetify.config.ts` (`VTextField`/`VTextarea`/`VSelect` are `outlined` there) — **never re-pass `variant="outlined"` at a call site to chase a missing border**; it changes nothing and violates the never-repeat-a-global-default rule in the `vuetify` skill.
- **State-dependent border colour** — when error and focus-within are mutually exclusive, put both colours in the `:class` conditional so only the active state's colour class is present (`:class="isError ? ['b-error'] : ['b-border', 'focus-within:b-info']"`), and keep the theme colour as a `b-*` utility rather than a raw rgba arbitrary value.

**Border-radius (`rd` prefix)** — never the Vuetify `rounded="sm"` prop or `rounded-sm` class: `rd` not `rounded`, `rd-t-2` not `rounded-t-2`, `rd-full` not `rounded-full`. Two mappings aren't a direct rename — Vuetify `rounded-xl` is `rd-3xl` (24px), and `rounded-circle` is `rd="50%"`.

**Background:** `bg-transparent` not `background-transparent`. **Outline:** `outline-none` not `outline-0` (sets `outline: 2px solid transparent`).

## Named Utilities Over Numeric

Prefer UnoCSS **named** utilities over numeric equivalents whenever a name exists:

- Font weight: `font-medium` / `font-semibold` / `font-bold` — never `font-500` / `font-600` / `font-700`.
- Transition duration: `duration-[--transition-duration]` (the global variable from `globals.scss`) — never a raw `duration-200`.
- Vuetify helper classes (`font-weight-medium`, `font-weight-bold`, …) are **not** UnoCSS utilities — as attributify attributes they generate nothing. Only the shortcuts registered in `uno.config.ts` work (MD3 typography, theme/palette colours, semantic opacity). Use the UnoCSS named form (`font-medium`) instead.

## Gap Directionality

Use axis-specific gap utilities instead of omnidirectional `gap-{n}`: **`flex` (row)** → `gap-x-{n}`; **`flex-col`** → `gap-y-{n}`; **`grid` / 2D layouts** → `gap-{n}` (both axes intentional).

## Sentence-Like Rows Stay Inline Flow

A row that reads as one sentence (avatar + "Posted by" + name + timestamp, an inline label with an icon) must stay in **inline flow** — `space-x-{n}` on the container, `align-middle` on the avatar/icon. Do not use `flex`: every item becomes a shrinkable box, so narrow viewports break each one internally ("Posted / by", "4 minutes / ago" stacked in columns) instead of wrapping mid-sentence like prose.

`flex` is for rows of independent boxes (toolbars, cards, controls) — there each item wrapping as a unit is what you want. `gap-x-*` has no effect in inline flow, which is why this is the one place `space-x-*` is the right utility.

## The Parent Owns Spacing

Space between siblings belongs to the container, as `gap-*`. Space inside a boundary belongs to that boundary, as `padding`. A child should not carry a margin to position itself against its siblings — it can't know what it sits next to, so the same margin gets re-solved in every component that renders it.

Three reliable signals that a margin is in the wrong place:

- **A reset undoing a default** (`mb-0`, `class="m-0"`) — the child is fighting spacing it should never have had. Fix the owner, don't stack a counter-margin.
- **A negative margin** (`ml--2`, `my--1`) — the parent's padding and the child's margin are fighting; one of them is wrong.
- **The same margin in sibling files** (`<v-icon mr-2 />` repeated across rows) — that's one gap the row should own, not N margins.

Margin stays correct for a few things: pushing an element within an already-`gap`-ed row (`ma-auto`, `mt-auto`), and off-scale nudges that aren't sibling rhythm at all — though reach for absolute positioning first. When converting a child margin to a parent `gap`, check the trailing edge: a `mb-*` on every child also pads _below the last one_, which `gap-y-*` deliberately does not. If that trailing space was load-bearing (scroll breathing room), move it to the container's `padding`, don't reintroduce the margin.

## Absolute Positioning Within a Container

Use `relative` on the parent and `absolute top-0 right-0` (or other corners) to pin UI elements. Prefer this over manual margin/padding tricks when an element should float independent of sibling flow.

## Style Block

- Use `<style scoped>` — `scoped` always required, enforced by `vue/enforce-style-attribute`. A genuinely global block (transition classes targeting slotted/teleported content, overrides for third-party DOM appended to `document.body`) carries an `<!-- eslint-disable-next-line vue/enforce-style-attribute -- <reason> -->` comment naming why scoping cannot reach the target.
- **Library CSS is imported in script setup** (`import "grapesjs/dist/css/grapes.min.css";`), never via an unscoped `<style>` `@use` block — the import stays code-split with the component and leaves no global style block behind.
- Omit `lang="scss"` unless the block uses Sass features (variables, nesting, mixins). Plain CSS doesn't need it.
- **Switch to `lang="scss"` the moment nesting simplifies the block** — many `:deep(...)` rules repeating one root selector collapse to one nested root. If a plain-CSS block repeats an ancestor selector 3+ times, refactor it to nested SCSS; conversely never add `lang="scss"` to a block that stays flat.
