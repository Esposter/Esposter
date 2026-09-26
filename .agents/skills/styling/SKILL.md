---
name: styling
description: Apply when writing or reviewing styles in .vue or .scss files, or laying out a page, panel, sidebar, or border. Esposter UnoCSS Attributify Mode styling conventions — prop-based attributes for every static style with class kept for scoped refs, dynamic bindings and third-party selectors, theme primitives and theme colours over bespoke values, muted text over a fixed grey, text-info links, the library's tint over a hand-picked hover surface, state variants over &:hover blocks, the parent owning spacing, rem never px, no fixed dimension on a layout region, borders drawn once, and the style block as the exception.
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
- `references/theme-utilities.md` — when reaching for a type size, a token or palette colour, a named opacity, or muted text.
- `references/style-blocks.md` — when a component genuinely needs a `<style>` block, or a scoped rule or `:deep()` does not apply.
- `references/arbitrary-values.md` — when a utility needs an arbitrary `[...]` value: `calc()`, a CSS variable, a transition, or `!important`.
- `references/css-custom-properties.md` — when a `<style>` block needs a shared value, and a SASS variable looks like the way to reach it.
- `references/lengths.md` — when writing an authored length, or sizing an empty element on a flex axis.
- `references/class-attribute.md` — when a style seems to need `class` or a scoped rule, or a utility is switched on a condition.
- `references/links.md` — when styling a link or inline text that runs an action.
- `references/state-variants.md` — when a colour changes with state, or a shaded cell also takes a tint.
- `references/spacing.md` — when spacing siblings or reaching for a margin.

## Core Rules

- Prop-based styling for ALL static styles: `<div text-red p-4>`. Where UnoCSS attributes sit relative to component props is the `vue` skill's template attribute order (`references/ordering.md`).
- `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible. They are authored lengths, so they take `rem` — `size="4rem"`.
- Prefer simple named utilities over arbitrary values. Avoid arbitrary shadows, gradients, dimensions, border widths, and z-index unless the layout needs them. Don't add z-index defensively; rely on DOM order and positioning first.
- Prefer theme primitives over bespoke styling: the library's surfaces (`ui-frame`, `ui-card`) and type for card/panel/surface backgrounds (`ui-library` skill); token colours (`bg-background`, `b-border`, `text-accent`, `text-muted`) before custom colours. Surface colour is a library surface, never `bg-panel` on a `<div>` (`references/layout.md`).
- Avoid arbitrary hex/RGB/RGBA, custom shadows, and one-off background/border colours in app UI. A colour a template needs is a token, and one the tokens lack is a new token rather than a raw value (`ui-library` skill).
- Never hardcode a fixed dimension to lay out a **region** (sidebar/panel/column split) — `references/layout.md`. Arbitrary dimensions are a last resort for true format constraints (`aspect-video`, viewport-safe containers, canvas/game surfaces, third-party embeds); first check whether the component hierarchy or flex/grid structure is wrong.
- **An empty element sized along a flex axis takes `shrink-0`** (`references/lengths.md`).
- **Always `rem`, never `px`**, for every authored length; `px` survives only where the unit is not ours to choose (`references/lengths.md`).
- **A viewport height is `dvh`, never `vh` or `h-screen`** — a mobile browser's toolbar comes and goes over `vh`. `BLOCKED_SPELLINGS` refuses both, so a `vh` value generates no CSS at all rather than a wrong height (`unocss` skill, `references/blocklist.md`).
- `field-sizing: content` is an attributify utility — put `field-sizing-content` directly on the `<input>` / `<textarea>`, never in a scoped class.

## The look is the app's, on every page

An immersive page (`apps/web/app/layouts/immersive.vue`) is one with no app frame, and nothing more: it brings its own way back, not a look of its own. The look is the UI library's tokens, which every page reads whichever library draws it — a colour on any page is a token, and a page that sets its own palette on its root is a finding (the `ui-library` skill). The agent console stays in dusk through a theme scope rather than a palette of its own (`apps/web/content/docs/architecture/ui-library.md`). Every rule on this page holds inside an immersive page as on any other.

## What stays in `class="..."`

Only a scoped CSS ref, a `:class` binding (the home of a valueless utility switched on a condition), a third-party or SVG class and `group` — everything else is an attribute (`references/class-attribute.md`).

## Theme utilities are attributify too — `references/theme-utilities.md`

`presetAttributify()` is active, so every token colour, named opacity and palette colour is a standalone attribute; which names generate a utility at all, and the opacity spelling, are that page.

## Links use `text-info` (the blue), never `text-accent`

A link is `text-info` with `hover:underline`; inline text that runs an action is a native `<button type="button">` in the link colour (`references/links.md`).

## State variants are utilities, not `&:hover` blocks

A state colour is a variant utility (`hover:text-text`), never an `&:hover` block, and a hover or selected background is the library's tint, never a picked surface (`references/state-variants.md`).

## Utility vocabulary — `references/utility-vocabulary.md`

Where two spellings say the same thing, one is the repo's. **Choosing between an abbreviation and its long form, a named step and a numeric one, a directional gap, or a slash value against a bare one** is that page.

## Images Are `<NuxtImg>` — `references/images.md`

A raw `<img>` is a `vue/no-restricted-html-elements` error. Read the page when adding or sizing one: `width`/`height` are html attributes rather than styles, sizing is CSS utilities, and `object-contain`/`object-cover` is stated wherever both dimensions are constrained.

## The Parent Owns Spacing

Space between siblings is the container's `gap-*`, space inside a boundary its padding; a reset, a negative margin or one margin repeated across siblings means the space is in the wrong place (`references/spacing.md`).

## Absolute Positioning Within a Container

Use `relative` on the parent and `absolute top-0 right-0` (or other corners) to pin UI elements. Prefer this over manual margin/padding tricks when an element should float independent of sibling flow.

## Style Block — `references/style-blocks.md`

`<style scoped>` always (`vue/enforce-style-attribute`), plain CSS until nesting earns `lang="scss"`, library CSS imported in script setup. A Fragment-rooted child defeats `scoped` and `:deep()` alike, silently — that page.
