# Arbitrary Bracket Values — `calc()`, CSS Variables, Transitions, `!important`

## Arbitrary CSS Values

Use UnoCSS square-bracket syntax for arbitrary values — including `calc()` and CSS variable references — directly as props. **Always the valued form, `prop="[…]"`; a bare `prop-[…]` attribute is silently inert.** UnoCSS extracts a bracketed token as a class, so `<div font-[Montserrat]>` generates `.font-[Montserrat]` and the element — which carries an attribute, not a class — matches nothing. It fails the same way in every position, so the rule has no exception: brackets go inside the quotes.

```html
<div sticky top="[calc(1rem+--app-bar-height)]" />
<div h="[calc(100dvh_-_--app-bar-height)]" overflow-y-auto />
<div bg="[#f0f0f0]" />
```

Spaces inside `calc()` must be omitted or replaced with `_`: `calc(1rem+--x)` not `calc(1rem + var(--x))`.

## CSS Variables in Arbitrary Values

**Prefer the bare `--variable` shorthand where the variable is a whole term of the value** — UnoCSS auto-wraps a `--variable` it finds there with `var()`:

```html
<!-- Prefer — bare --variable shorthand -->
<div duration="[--transition-duration]" />
<div top="[--app-bar-height]!" />
<!-- Valid but verbose — use the shorthand for single variables -->
<div duration="[var(--transition-duration)]" />
```

**Inside a function argument the shorthand does not apply, and getting it wrong fails silently.** UnoCSS wraps
only the top-level term, so `shadow="[0_0_0.3125rem_rgb(--v-theme-primary-lighten-1)]"` reaches the browser as
`rgb(--v-theme-primary-lighten-1)`, which is not a colour: the whole declaration is dropped and the shadow
simply is not there. The utility still matches, so nothing warns — the tell is a rule the generated CSS never
contains. Write `rgb(var(--v-theme-primary-lighten-1))` in that position, always.

`var()` inside brackets is therefore not merely tolerated — it is required for composite values like
`b="[rgba(var(--v-border-color),var(--v-border-opacity))]"`, and the shorthand is for the case where the
variable stands alone.

Exception: `var()` inside `<style scoped>` blocks and `:style` binding objects stays as-is.

## Transitions

The CSS `transition` shorthand is written as separate UnoCSS attributes — one for property, one for duration:

```html
<!-- Single property + CSS-variable duration -->
<a transition-colors duration="[--transition-duration]" />
<!-- Multi-property with the same static duration: single arbitrary value -->
<button transition="[box-shadow_0.2s,transform_0.2s]" />
```

- Single known property → UnoCSS shorthand (`transition-colors`, `transition-shadow`, `transition-transform`, `transition-opacity`, etc.)
- Override the default duration with a separate `duration-{n}` or `duration="[--x]"` (no `var()` wrapper)
- Multi-property transitions (e.g. `box-shadow` + `transform`) must stay a single `transition="[...]"` arbitrary value — splitting them makes the second `transition-property` override the first
- Spaces in arbitrary `transition` values become `_`

## `!important` Variant

Append `!` inside the attribute value to generate `!important`. Use only when overriding third-party styles that can't be targeted otherwise:

```html
<!-- top: var(--app-bar-height) !important; z-index: 1500 !important -->
<div top="[--app-bar-height]!" z="[1500]!" />
```
