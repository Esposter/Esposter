---
name: styling
description: Esposter UnoCSS Attributify Mode styling conventions — prop-based attributes for all static styles, class only for scoped CSS refs / dynamic bindings / third-party selectors, theme primitives and theme colours over bespoke values, the MD3 typography set and semantic opacity in place of a fixed text-gray, text-info links, hover:bg-hover over a hand-picked surface, state variants instead of scoped &:hover blocks, the parent owning spacing (gap/padding over child margins), absolute positioning within a container, rem over px with its narrow exceptions, and style-block rules — plus deep dives on the utility vocabulary (slash/fraction values in valued attributify, abbreviated utilities, an equal w-/h- pair collapsing to size-, named over numeric, and gap directionality), page/panel/sidebar/region layout, border utilities and ownership including the banned global border reset, sentence-like rows in inline flow, images as NuxtImg, and arbitrary bracket values (calc, CSS variables, transitions, !important). Apply when writing or reviewing styles in .vue or .scss files, or laying out a page, panel, sidebar, or border.
---

# Styling — UnoCSS Attributify Mode (MANDATORY)

## Deep Dives

- `references/layout.md` — when laying out a page, panel, sidebar or column split, sizing a region, drawing a border or finding one you did not ask for, or building a row that reads as one sentence.
- `references/utility-vocabulary.md` — when two spellings say the same thing: an abbreviation, a named step against a numeric one, a directional gap, or a slash value.
- `references/images.md` — when adding or sizing an image.
- `references/arbitrary-values.md` — when a utility needs an arbitrary `[...]` value: `calc()`, a CSS variable, a transition, or `!important`.

## Core Rules

- Prop-based styling for ALL static styles: `<div text-red p-4>`. Where UnoCSS attributes sit relative to component props is the `vue` skill's template attribute order.
- `flex` not `d-flex`.
- `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible. They are authored lengths, so they take `rem` — `size="4rem"`, never `size="64"`, which Vuetify renders as `px`.
- Prefer simple named utilities over arbitrary values. Avoid arbitrary shadows, gradients, dimensions, border widths, and z-index unless the layout needs them. Don't add z-index defensively; rely on DOM order and positioning first.
- Prefer theme primitives over bespoke styling: `StyledCard` / `v-sheet` for card/panel/surface backgrounds; theme colours (`bg-background`, `b-border`, `text-primary`, `text-error`) and semantic opacity utilities before custom colours. For surface colour use `v-sheet`, not `bg-surface` on a `<div>` (`references/layout.md`).
- Avoid arbitrary hex/RGB/RGBA, custom shadows, and one-off background/border colours in app UI. If a semantic colour is genuinely needed, prefer Vuetify theme colours or the Material palette with lighten/darken variants (`text-green-darken-2`, `bg-yellow-lighten-5`, `text-red`) over raw values.
- Never hardcode a fixed dimension to lay out a **region** (sidebar/panel/column split) — `references/layout.md`. Arbitrary dimensions are a last resort for true format constraints (`aspect-video`, viewport-safe containers, canvas/game surfaces, third-party embeds); first check whether the component hierarchy or flex/grid structure is wrong.
- **Always `rem`, never `px`** for every authored CSS length — style blocks, `:root` tokens, inline style objects, arbitrary `[...]` values. Zero takes no unit (`bottom: "0"`). Utility names are not authored lengths, so scale tokens (`p-4`, `top--1`) and `b-{n}` widths keep their canonical form.
  - **`px` survives only where the unit is not ours to choose**: a value staying numerically in step with a JS API (`$grid-breakpoints` against `useDisplay().thresholds`, a drawer width also passed as `:width`), SVG user-space attributes, HTML email, and vendored output mirrored into a snapshot.
  - A round `px` that is already a token is a duplicated constant first — `borderRadius: "4px 0 0 4px"` wants `var(--border-radius)`, not `"0.25rem"`.
- `field-sizing: content` is an attributify utility — put `field-sizing-content` directly on the `<input>` / `<textarea>`, never in a scoped class.

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

- Vuetify MD3 typography: **every** role in `typographyPresets.md3` is a shortcut, kebab-cased — the five scales (`display`, `headline`, `title`, `body`, `label`) crossed with `large`/`medium`/`small`. `uno.config.ts` generates them from the preset, so there is no shorter allowlist to check against. Never MD2 utilities like `text-caption`; use the MD3 equivalent (`text-body-small`).
- Vuetify theme colours: `bg-surface`, `bg-background`, `bg-border`, `text-error`, `text-info`, etc.
- Opacity emphasis: use `op-medium-emphasis` / `op-high-emphasis`, not `text-medium-emphasis` — and not the number either. `op-60` is `--v-medium-emphasis-opacity`'s default written out a second time, so it stops tracking the theme the moment that variable moves; the numeric scale is for what is genuinely not emphasis, like the `op-0` → `group-hover:op-100` of a reveal. **De-emphasised text is an emphasis opacity, never a grey** — `text-gray` resolves against preset-wind4's palette rather than the Vuetify theme, so it paints one fixed grey in both themes and drifts out of contrast in one of them, while `op-medium-emphasis` applies `var(--v-medium-emphasis-opacity)` over the current text colour. Paired with `text-body-small` (captions, timestamps, hints) it already has a name: `text-hint`.
- Custom theme colours: `bg-surface-opacity-80`, `bg-background-opacity-40`, etc.
- The preset's own palette: `text-amber`, `text-orange`, `bg-sky`, etc. Vuetify's palette names are **not** the same set — `bg-deep-purple` and `text-yellow-darken-4` come from `$color-pack`, which emits classes only, so as attributes they generate nothing. Generate the CSS if unsure; a palette name that matches no rule fails silently.

Only registered colors generate utilities — don't assume a Vuetify default theme colour works: use `text-primary` not `text-success`, `bg-surface` not `bg-surface-variant`. Registration rules (theme colours, palette, safelisting) live in the `unocss` skill. When reading hyphenated theme colours from a colours store, destructure quoted keys and alias to camel-case: `const { "hyphenated-key": hyphenatedKey } = storeToRefs(colorsStore);`.

### Links use `text-info` (the blue), never `text-primary`

Hyperlinks / clickable inline text get `text-info` — that is the conventional link blue, underlined on hover rather than always (`hover:underline`). `text-primary` is the brand/action accent, not a link colour. It applies to `NuxtLink`, `NuxtInvisibleLink` and every inline "click here" affordance, whichever of them a case calls for.

**Inline text that runs an action rather than navigating is `StyledActionLink`, never a hand-styled span or a raw `<a>`.** A raw `<a>` is lint-banned, and hand-styling the span means re-deciding the colour, the hover underline, the pointer and the whole keyboard-and-role wiring at each call site — which is how one of them ends up unfocusable, or bold-with-a-hover-underline where its twin is permanently blue and underlined. It takes a `@click` and its children are the words in the sentence: `<StyledActionLink @click="isOpen = true">create one</StyledActionLink>`. A link that navigates stays a `NuxtLink`.

### State variants are utilities, not `&:hover` blocks

A colour that changes on hover/focus/disabled is a variant utility (`hover:text-primary-darken-1`, `focus-within:b-info`, `disabled:op-30`), never a scoped `&:hover` rule. Colons inside attribute names are valid in Vue templates — only a **leading** `:` triggers `v-bind`.

**A hover or active background is `hover:bg-hover` / `bg-activated`, never a hand-picked surface colour.** Both are defined in `uno.config.ts` from the same `calc(var(--v-<state>-opacity) * var(--v-theme-overlay-multiplier))` formula `VBtn` uses, so a custom affordance lands on exactly the colour a real button does and follows the theme when those variables move. `hover:bg-surface` instead is a shade off every button beside it, invisibly until the two sit together.

The tint is an **overlay over whatever is underneath**, not a palette: a control whose background is itself the design — a chip swapping its own fill to read as selected — keeps its explicit colour.

## Utility vocabulary — `references/utility-vocabulary.md`

Where two spellings say the same thing, one is the repo's. **Choosing between an abbreviation and its long form, a named step and a numeric one, a directional gap, or a slash value against a bare one** is that page.

## Images Are `<NuxtImg>` — `references/images.md`

`<v-img>` and raw `<img>` are both `vue/no-restricted-html-elements` errors. Read the page when adding or sizing one: `width`/`height` are html attributes rather than styles, sizing is CSS utilities, and `object-contain`/`object-cover` is stated wherever both dimensions are constrained.

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

- Use `<style scoped>` — `scoped` always required, enforced by `vue/enforce-style-attribute`. A genuinely global block (transition classes targeting slotted/teleported content, overrides for third-party DOM appended to `document.body`, or a child component whose root is a **Fragment**) carries an `<!-- eslint-disable-next-line vue/enforce-style-attribute -- <reason> -->` comment naming why scoping cannot reach the target. Keep that comment on **one line** — `disable-next-line` above a wrapped comment points at the comment's own second line, and the rule still fires.
- **A Fragment-rooted child defeats `scoped` and `:deep()` alike, silently.** Vue passes the parent's `data-v-` scope id onto a child component's root element only when the child has exactly one root; with a Fragment it applies the id to nothing. `scoped` then compiles to `.x[data-v-a]` and matches no third-party node, and `:deep()` compiles to `[data-v-a] .x` with no ancestor to anchor to — both produce valid CSS that never matches, so nothing errors and the style just does not apply. Check the child's compiled render for `createElementBlock(Fragment` before assuming a selector is wrong (`survey-creator-vue`'s `Creator` is one). Wrapping the child in a plain element restores `:deep()` by giving the id somewhere to land, at the cost of a DOM node that exists only to host an attribute; an unscoped block with the directive above is usually the better trade.
- **Library CSS is imported in script setup** (`import "grapesjs/dist/css/grapes.min.css";`), never via an unscoped `<style>` `@use` block — the import stays code-split with the component and leaves no global style block behind.
- Omit `lang="scss"` unless the block uses Sass features (variables, nesting, mixins). Plain CSS doesn't need it.
- **Switch to `lang="scss"` the moment nesting simplifies the block** — many `:deep(...)` rules repeating one root selector collapse to one nested root. If a plain-CSS block repeats an ancestor selector 3+ times, refactor it to nested SCSS; conversely never add `lang="scss"` to a block that stays flat.
