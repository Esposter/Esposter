---
name: styling
description: Apply when writing or reviewing styles in .vue or .scss files, or laying out a page, panel, sidebar, or border. Esposter UnoCSS Attributify Mode styling conventions — prop-based attributes for every static style with class kept for scoped refs, dynamic bindings and third-party selectors, theme primitives and theme colours over bespoke values, semantic opacity over a fixed grey, text-info links, hover:bg-hover over a hand-picked surface, state variants over &:hover blocks, the parent owning spacing, rem never px, no fixed dimension on a layout region, borders drawn once, and the style block as the exception.
---

# Styling — UnoCSS Attributify Mode (MANDATORY)

## Settled — do not re-propose

- **A check for an attribute on a component that generates no rule** — it is as likely one of the component's props as a misspelt utility, and telling the two apart needs the component's prop list no template extraction has; a native element is `apps/web/app/templates.test.ts`, and every inert family met so far is the blocklist (`unocss` skill).
- **A rule for theme primitive vs bespoke colour** — needs the palette in mind and a judgement about intent.
- **A rule for a fixed dimension on a layout region** — what a region is, is the judgement.

## Deep Dives

- `references/layout.md` — when laying out a page, panel, sidebar or column split, sizing a region, drawing a border or finding one you did not ask for, or building a row that reads as one sentence.
- `references/utility-vocabulary.md` — when two spellings say the same thing: an abbreviation, a named step against a numeric one, a directional gap, or a slash value.
- `references/images.md` — when adding or sizing an image.
- `references/theme-utilities.md` — when reaching for a typography role, a theme or palette colour, or an opacity emphasis.
- `references/style-blocks.md` — when a component genuinely needs a `<style>` block, or a scoped rule or `:deep()` does not apply.
- `references/arbitrary-values.md` — when a utility needs an arbitrary `[...]` value: `calc()`, a CSS variable, a transition, or `!important`.

## Core Rules

- Prop-based styling for ALL static styles: `<div text-red p-4>`. Where UnoCSS attributes sit relative to component props is the `vue` skill's template attribute order (`references/ordering.md`).
- `flex` not `d-flex`.
- `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible. They are authored lengths, so they take `rem` — `size="4rem"`, never `size="64"`, which Vuetify renders as `px`.
- Prefer simple named utilities over arbitrary values. Avoid arbitrary shadows, gradients, dimensions, border widths, and z-index unless the layout needs them. Don't add z-index defensively; rely on DOM order and positioning first.
- Prefer theme primitives over bespoke styling: `StyledCard` / `v-sheet` for card/panel/surface backgrounds; theme colours (`bg-background`, `b-border`, `text-primary`, `text-error`) and semantic opacity utilities before custom colours. For surface colour use `v-sheet`, not `bg-surface` on a `<div>` (`references/layout.md`).
- Avoid arbitrary hex/RGB/RGBA, custom shadows, and one-off background/border colours in app UI. If a semantic colour is genuinely needed, prefer Vuetify theme colours or the Material palette with lighten/darken variants (`text-green-darken-2`, `bg-yellow-lighten-5`, `text-red`) over raw values.
- Never hardcode a fixed dimension to lay out a **region** (sidebar/panel/column split) — `references/layout.md`. Arbitrary dimensions are a last resort for true format constraints (`aspect-video`, viewport-safe containers, canvas/game surfaces, third-party embeds); first check whether the component hierarchy or flex/grid structure is wrong.
- **An empty element sized along a flex axis takes `shrink-0`** — a separator, a spacer bar, a dot. With no content its minimum size is zero, so once the container overflows (a menu capped by `max-h` and scrolling) the browser takes the space back from it first: the `h-1` still computes, the margins still show as a gap, and the bar paints at `0px`. A test counting the element cannot catch it.
- **Always `rem`, never `px`** for every authored CSS length — style blocks, `:root` tokens, inline style objects, arbitrary `[...]` values. Zero takes no unit (`bottom: "0"`). Utility names are not authored lengths, so scale tokens (`p-4`, `top--1`) and `b-{n}` widths keep their canonical form.
  - **`px` survives only where the unit is not ours to choose**: a value staying numerically in step with a JS API (`$grid-breakpoints` against `useDisplay().thresholds`, a drawer width also passed as `:width`), SVG user-space attributes, HTML email, and vendored output mirrored into a snapshot.
  - A round `px` that is already a token is a duplicated constant first — `borderRadius: "4px 0 0 4px"` wants `var(--border-radius)`, not `"0.25rem"`.
- `field-sizing: content` is an attributify utility — put `field-sizing-content` directly on the `<input>` / `<textarea>`, never in a scoped class.

## The look is the app's, on every page

An immersive page (`apps/web/app/layouts/immersive.vue`) is one with no app frame, and nothing more: it brings its own way back, not a look of its own. The look is the UI library's tokens, which every page reads whichever library draws it — a colour on any page is a token, and a page that sets its own palette on its root is a finding (the `ui-library` skill). The agent console stays in dusk through a theme scope rather than a palette of its own (`apps/web/content/docs/architecture/ui-library.md`). Every rule on this page holds inside an immersive page as on any other.

## What stays in `class="..."`

Only when technically required:

- **Scoped CSS refs** — class names referenced in `<style scoped>` (e.g. `class="card"`)
- **Dynamic bindings** — `:class="..."` always stays as-is, and a **valueless** utility switched on a condition belongs there rather than in a bound attribute. `:py="isCompact ? 0.5 : 1"` is fine: the extractor reads the literals and emits `[py~="0.5"]` and `[py~="1"]`. `:op-loading="isLoading ? '' : undefined"` is not — an empty string is no value, so nothing is emitted and the attribute lands on a rule only when some unrelated file happens to write that utility bare. It fails silently and comes back the day that file changes, so `apps/web/app/templates.test.ts` refuses the shape — the generator is what tells a utility from a prop the empty string is a real value for, which no selector can ask. `:class="isLoading ? 'op-loading' : undefined"` emits the class and depends on nothing
- **Third-party component classes** — e.g. `vue-flow__panel`, `v-window__controls`, `fc-event-title`, Vuetify internal `v-`-prefixed classes (e.g. `v-theme--light`)
- **SVG classes** — e.g. `fclass1`, `a`, `b`
- **`group`** — UnoCSS group variant token; must stay in `class` so descendant `group-hover:` variants work

A scoped class (with `v-bind()` for reactive values) also stays correct where attributify cannot reach: structural pseudo-selectors (`:nth-child`, `:not()`, `:first-of-type`), `:deep()` rules, bare element/tag selectors, and non-colour reactive values (`transform`, `top`, `height`, `fill`, `animation`). Everything else — a class that only sets a theme colour, a hover colour, or arbitrary-value properties — is an attribute.

## Theme utilities are attributify too — `references/theme-utilities.md`

`presetAttributify()` is active, so every MD3 typography role, theme colour, `op-*-emphasis` and palette colour is a standalone attribute; which names generate a utility at all, and the opacity spelling, are that page.

## Links use `text-info` (the blue), never `text-primary`

Hyperlinks / clickable inline text get `text-info` — that is the conventional link blue, underlined on hover rather than always (`hover:underline`). `text-primary` is the brand/action accent, not a link colour. It applies to `NuxtLink`, `NuxtInvisibleLink` and every inline "click here" affordance, whichever of them a case calls for.

**Inline text that runs an action rather than navigating is `StyledActionLink`, never a hand-styled span or a raw `<a>`.** A raw `<a>` is lint-banned, and hand-styling the span means re-deciding the colour, the hover underline, the pointer and the whole keyboard-and-role wiring at each call site — which is how one of them ends up unfocusable, or bold-with-a-hover-underline where its twin is permanently blue and underlined. It takes a `@click` and its children are the words in the sentence: `<StyledActionLink @click="isOpen = true">create one</StyledActionLink>`. A link that navigates stays a `NuxtLink`.

## State variants are utilities, not `&:hover` blocks

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

Margin stays correct for a few things: pushing an element within an already-`gap`-ed row (`m-a`, `mt-a`), and off-scale nudges that aren't sibling rhythm at all — though reach for absolute positioning first. When converting a child margin to a parent `gap`, check the trailing edge: a `mb-*` on every child also pads _below the last one_, which `gap-y-*` deliberately does not. If that trailing space was load-bearing (scroll breathing room), move it to the container's `padding`, don't reintroduce the margin.

## Absolute Positioning Within a Container

Use `relative` on the parent and `absolute top-0 right-0` (or other corners) to pin UI elements. Prefer this over manual margin/padding tricks when an element should float independent of sibling flow.

## Style Block — `references/style-blocks.md`

`<style scoped>` always (`vue/enforce-style-attribute`), plain CSS until nesting earns `lang="scss"`, library CSS imported in script setup. A Fragment-rooted child defeats `scoped` and `:deep()` alike, silently — that page.
