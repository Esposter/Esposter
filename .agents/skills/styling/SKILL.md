---
name: styling
description: Esposter UnoCSS Attributify Mode styling conventions — prop-based attributes for all static styles, flex not d-flex, class only for dynamic or Vuetify-specific utilities. Apply when writing .vue or .scss files.
---

# Styling — UnoCSS Attributify Mode (MANDATORY)

- Use prop-based styling: `<div text-red p-4>` for ALL static styles.
- **UnoCSS attributes go first** — before Vue/component props. e.g. `<StyledAvatar mr-3 :image="image" :name="name" />`
- Use `flex` not `d-flex`.
- Use `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible.
- Only use `class="..."` when technically required (dynamic `:class` bindings, Vuetify-specific typography/colour classes like `text-overline`, `text-medium-emphasis`, `text-wrap`, Vuetify CSS variable-based colours like `bg-surface-variant`). UnoCSS utilities (spacing, flex, sizing) must always be attributes even when mixed with Vuetify classes: `<div class="text-overline" mb-2>`.
- **Vuetify colour tokens** (e.g. `bg-surface-variant`, `bg-surface`, `text-on-surface`) must stay in `class="..."` — they are Vuetify CSS variable shorthands, not UnoCSS utilities, and do not work as attributify props.

## Abbreviated Utilities

Always use UnoCSS abbreviated shorthand forms — they are first-class UnoCSS utilities:

**Border (`b-` prefix):**

- `b-none` not `border-none`
- `b-0` not `border-0`
- `b-1` not `border-1`
- `b-solid` not `border-solid`
- `b-t-2` not `border-top-2`
- `b-x-1` not `border-x-1`

**Border-radius (`rd` prefix):**

- `rd` not `rounded`
- `rd-1` not `rounded-1`
- `rd-t-2` not `rounded-t-2`
- `rd-full` not `rounded-full`

**Background (`bg-` prefix):**

- `bg-transparent` not `background-transparent`

**Outline:**

- `outline-none` not `outline-0` (sets `outline: 2px solid transparent`)

When in doubt, prefer the shorter form — UnoCSS abbreviations are canonical in this project.

## Units

- **Always use `rem` instead of `px`** for all CSS values (font sizes, spacing, widths, heights, borders, etc.).

## Style Block

- Always use `<style scoped lang="scss">` — `scoped` before `lang`.
