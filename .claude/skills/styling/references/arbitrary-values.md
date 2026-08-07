# Arbitrary Bracket Values — `calc()`, CSS Variables, Transitions, `!important`

## Arbitrary CSS Values

Use UnoCSS square-bracket syntax for arbitrary values — including `calc()` and CSS variable references — directly as props:

```html
<UserSideBar sticky top="[calc(1rem+--app-bar-height)]" />
<div h="[calc(100dvh_-_--app-bar-height)]" overflow-y-auto />
<div bg="[#f0f0f0]" />
```

Spaces inside `calc()` must be omitted or replaced with `_`: `calc(1rem+--x)` not `calc(1rem + var(--x))`.

## CSS Variables in Arbitrary Values

**Prefer the bare `--variable` shorthand inside the brackets** — UnoCSS auto-wraps `--variable` names with `var()`:

```html
<!-- Prefer — bare --variable shorthand -->
<div duration="[--transition-duration]" />
<div top="[--app-bar-height]!" />
<div shadow="[0_0_5px_rgb(--v-theme-primary-lighten-1)]" />
<!-- Valid but verbose — use the shorthand for single variables -->
<div duration="[var(--transition-duration)]" />
```

`var()` inside brackets is not an error — it's the natural form for composite values like `b="[rgba(var(--v-border-color),var(--v-border-opacity))]"`. Just prefer the shorthand for the simple single-variable case.

Exception: `var()` inside `<style scoped>` blocks and `:style` binding objects stays as-is.

## Transitions

The CSS `transition` shorthand is written as separate UnoCSS attributes — one for property, one for duration:

```html
<!-- Single property + CSS-variable duration -->
<NuxtInvisibleLink transition-colors duration-[--transition-duration] />
<!-- Multi-property with the same static duration: single arbitrary value -->
<button transition="[box-shadow_0.2s,transform_0.2s]" />
```

- Single known property → UnoCSS shorthand (`transition-colors`, `transition-shadow`, `transition-transform`, `transition-opacity`, etc.)
- Override the default duration with a separate `duration-{n}` or `duration-[--x]` (no `var()` wrapper)
- Multi-property transitions (e.g. `box-shadow` + `transform`) must stay a single `transition="[...]"` arbitrary value — splitting them makes the second `transition-property` override the first
- Spaces in arbitrary `transition` values become `_`

## `!important` Variant

Append `!` inside the attribute value to generate `!important`. Use only when overriding third-party styles that can't be targeted otherwise:

```html
<!-- top: var(--app-bar-height) !important; z-index: 1500 !important -->
<NuxtLoadingIndicator top="[--app-bar-height]!" z="[1500]!" />
```
