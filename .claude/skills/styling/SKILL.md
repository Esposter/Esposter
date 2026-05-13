---
name: styling
description: Esposter UnoCSS Attributify Mode styling conventions — prop-based attributes for all static styles, flex not d-flex, class only for scoped CSS refs / dynamic bindings / third-party selectors. Apply when writing .vue or .scss files.
---

# Styling — UnoCSS Attributify Mode (MANDATORY)

- Use prop-based styling: `<div text-red p-4>` for ALL static styles.
- **UnoCSS attributes go first** — before Vue/component props. e.g. `<StyledAvatar mr-3 :image="image" :name="name" />`
- Use `flex` not `d-flex`.
- Use `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible.
- Prefer simple named utilities over arbitrary values. Avoid arbitrary shadows, gradients, dimensions, border widths, and z-index utilities unless the layout genuinely needs them. Do not add z-index defensively; rely on DOM order and positioning first.

## What stays in `class="..."`

Only use `class="..."` when technically required:

- **Scoped CSS refs** — class names referenced in `<style scoped>` (e.g. `class="card"`, `class="card-content"`)
- **Dynamic bindings** — `:class="..."` always stays as-is
- **Third-party component classes** — e.g. `vue-flow__panel`, `v-window__controls`, `fc-event-title`, Vuetify internal classes that start with `v-` (e.g. `v-theme--light`)
- **SVG classes** — e.g. `fclass1`, `a`, `b`
- **`group`** — UnoCSS group variant selector token; must stay in `class` so descendant `group-hover:` variants work

## What can be attributify (including Vuetify utilities)

`presetVuetify()` + `presetAttributify()` are both active in `uno.config.ts`. This means **ALL** of the following work as standalone attributify attributes:

- Vuetify MD3 typography: `text-title-large`, `text-headline-small`, `text-body-large`, `text-body-small`, etc. Do not use MD2 typography utilities such as `text-caption`; use the MD3 equivalent (`text-body-small`) instead.
- Vuetify theme colours: `bg-surface`, `bg-background`, `bg-border`, `text-medium-emphasis`, `text-error`, `text-info`, etc.
- Custom theme colours: `bg-surface-opacity-80`, `bg-background-opacity-40`, etc.

### Custom Vuetify theme colours must be registered in `uno.config.ts`

All colors not explicitly defined in `vuetify.config.ts` must be added to `uno.config.ts` under `theme.colors` so UnoCSS can scan and generate them. Do not assume Vuetify default colors are supported: for example, use `text-primary` instead of `text-success`, and use `bg-surface` instead of `bg-surface-variant`.

```ts
// uno.config.ts
theme: {
  colors: {
    "primary-darken-1": 'rgb(var(--v-theme-primary-darken-1))',
    "surface-opacity-80": 'rgb(var(--v-theme-surface-opacity-80))',
    // all custom colours from vuetify.config.ts → getBaseColorsExtension + variations
  }
}
```

Check `vuetify.config.ts` for the canonical list. Standard palette colours are handled by `presetVuetify()` automatically.

When reading hyphenated theme colours from `useColorsStore()`, destructure quoted keys and alias them to local camel-case variables:

```ts
const { "background-opacity-40": backgroundOpacity40 } = storeToRefs(colorsStore);
```

## `v-bind(themeColor)` in CSS → attributify

When a scoped CSS class exists _only_ to set a Vuetify theme colour with `v-bind()`, convert it to attributify and delete the class:

```diff
- <StyledCard class="card">
+ <StyledCard bg-surface-opacity-80>

- <style scoped lang="scss">
- .card {
-   background-color: v-bind(surfaceOpacityColor);
- }
- </style>
```

Also remove the `storeToRefs` destructure (and `useColorsStore()` call if nothing else uses it).

### Hover state → `hover:utility`

`&:hover { color: v-bind(primary-darken-1); }` migrates to a standalone `hover:text-primary-darken-1` attribute:

```diff
- <NuxtInvisibleLink class="author" ...>
+ <NuxtInvisibleLink text-primary hover:text-primary-darken-1 transition-colors duration-[--transition-duration] ...>
```

Colons inside attribute names (e.g. `hover:text-primary-darken-1`) are valid in Vue templates — only a leading `:` triggers `v-bind`.

**Do NOT convert** when `v-bind` appears in:

- Structural pseudo-selectors: `:nth-of-type`, `:nth-child`, `:not()`, `:first-of-type`
- `:deep()` rules
- Complex shorthand properties with non-colour reactive values (`animation: ... v-bind(dur)`, `transform: ... v-bind(x)`)
- Non-colour reactive values (`transform`, `top`, `left`, `height`, `fill`, `stroke`)
- Element/tag selectors (`p`, `a`, `ul`, `li`)

## `!important` Variant

Append `!` inside the attribute value to generate `!important` CSS:

```html
<!-- top: var(--app-bar-height) !important; z-index: 1500 !important -->
<NuxtLoadingIndicator top="[--app-bar-height]!" z="[1500]!" />
```

Use only when overriding third-party component styles that can't be targeted otherwise.

## `field-sizing-content`

Replaces `field-sizing: content` in scoped CSS — use directly as an attributify attribute on `<input>` / `<textarea>` elements:

```diff
- <input class="input" ... />
+ <input field-sizing-content ... />

- <style scoped>
- .input { field-sizing: content; }
- </style>
```

## Arbitrary CSS Values

Use UnoCSS square-bracket syntax for arbitrary values — including `calc()` and CSS variable references — directly as attributify props:

```html
<!-- Instead of a scoped .sidebar { top: calc(1rem + var(--app-bar-height)) } -->
<UserSideBar sticky top="[calc(1rem+--app-bar-height)]" />

<!-- Fixed height with viewport calc -->
<div h="[calc(100dvh_-_--app-bar-height)]" overflow-y-auto />

<!-- Arbitrary colour via hex -->
<div bg="[#f0f0f0]" />
```

Spaces inside `calc()` must be omitted or replaced with `_`: `calc(1rem+--x)` not `calc(1rem + var(--x))`.

### CSS Variables in Arbitrary Values

**Never use `var()` inside UnoCSS arbitrary value brackets.** UnoCSS automatically wraps `--variable` names with `var()`:

```html
<!-- WRONG — var() keyword in template -->
<div duration="[var(--transition-duration)]" />
<div top="[var(--app-bar-height)]!" />
<div shadow="[0_0_5px_rgb(var(--v-theme-primary-lighten-1))]" />

<!-- CORRECT — --variable reference only -->
<div duration="[--transition-duration]" />
<div top="[--app-bar-height]!" />
<div shadow="[0_0_5px_rgb(--v-theme-primary-lighten-1)]" />
```

Exception: `var()` inside `<style scoped>` blocks and `:style` binding objects stays as-is — only the UnoCSS arbitrary value syntax gets the `--variable` shorthand.

When converting a scoped CSS class that only contains arbitrary-value properties, delete the class name and the `<style scoped>` block entirely.

## Transition Splitting

Split the CSS `transition` shorthand into separate UnoCSS attributes — one for the property, one for the duration:

```html
<!-- Single property + CSS-variable duration: split into two attributes -->
<NuxtInvisibleLink transition-colors duration-[--transition-duration] ...>
  <!-- Multi-property with same static duration: use single arbitrary value (no clean split) -->
  <button transition="[box-shadow_0.2s,transform_0.2s]" ...></button>
</NuxtInvisibleLink>
```

Rules:

- Single known property → use the UnoCSS shorthand (`transition-colors`, `transition-shadow`, `transition-transform`, `transition-opacity`, etc.)
- Override the default duration with a separate `duration-{n}` or `duration-[--x]` attribute (no `var()` wrapper)
- Multi-property transitions (e.g. `box-shadow` + `transform`) must stay as a single `transition="[...]"` arbitrary value — splitting them would cause the second `transition-property` to override the first
- Spaces in arbitrary `transition` values become `_`

## Abbreviated Utilities

Always use UnoCSS abbreviated shorthand forms — they are first-class UnoCSS utilities:

**Border (`b-` prefix) — never use Vuetify `border="sm"` prop or `border-sm` class:**

| Vuetify utility             | UnoCSS (use this) | Value |
| --------------------------- | ----------------- | ----- |
| `border-sm` / `border="sm"` | `b-1`             | 1px   |
| `border-md` / `border="md"` | `b-2`             | 2px   |
| `border-lg` / `border="lg"` | `b-4`             | 4px   |
| `border-xl` / `border="xl"` | `b-8`             | 8px   |

- `b-none` not `border-none`
- `b-0` not `border-0`
- `b-solid` not `border-solid`
- `b-t-2` not `border-top-2`
- `b-x-1` not `border-x-1`

Note: `b-1` sets `border-width: 1px`. **`b-solid` is NOT applied automatically — always add it explicitly whenever you use a border-color utility.** For theme-colour borders use `b-text`, `b-border`, `b-info`, `b-error`, `b-transparent`, etc. For the Vuetify overlay border use `b="[rgba(var(--v-border-color),var(--v-border-opacity))]"`.

**Border-color + border-style must always appear together:**

```html
<!-- WRONG — border won't render without b-solid -->
<div b-1 b-text>
  <!-- CORRECT -->
  <div b-solid b-1 b-text>
    <!-- CORRECT — dynamic color, static style -->
    <div b-solid b-1 :class="isError ? 'b-error' : 'b-border'"></div>
  </div>
</div>
```

This applies to all border-color utilities: `b-text`, `b-border`, `b-info`, `b-error`, `b-transparent`, `b-primary`, etc. — including those in dynamic `:class` bindings (put `b-solid` as a static attribute).

**`custom-border` / `border-color` scoped-class pattern → attributify:**

```diff
- <div class="custom-border" ...>
+ <div b-solid b-1 b-text ...>

- <style scoped>
- .custom-border { border: var(--border-width) var(--border-style) v-bind(text); }
- </style>
```

`--border-width: thin` = 1px → `b-1`. `--border-style: solid` → `b-solid` (must be explicit — not automatic). The theme colour (`text`, `border`, `info`, etc.) becomes the `b-*` suffix.

**BEM border class with focus/error variants (e.g. `parameter-chip`):**

```diff
- <div class="parameter-chip" :class="{ 'parameter-chip--error': isError }">
+ <div
+   :class="isError ? ['b-error'] : ['b-[rgba(var(--v-border-color),var(--v-border-opacity))]', 'focus-within:b-info']"
+   b-solid
+   b-w="[1.5px]"
+ >

- <style scoped lang="scss">
- .parameter-chip {
-   border: 1.5px solid rgba(var(--v-border-color), var(--v-border-opacity));
-   &:focus-within { border-color: rgb(var(--v-theme-info)); }
-   &--error { border-color: rgb(var(--v-theme-error)); }
- }
- </style>
```

When error and focus-within are mutually exclusive states, put both colours in the `:class` conditional so only the active state's colour class is present at any time.

**Border-radius (`rd` prefix) — never use Vuetify `rounded="sm"` prop or `rounded-sm` class:**

| Vuetify utility                           | UnoCSS (use this) | Value  |
| ----------------------------------------- | ----------------- | ------ |
| `rounded-sm` / `rounded="sm"`             | `rd-sm`           | 2px    |
| `rounded` / `rounded-md` / `rounded="md"` | `rd`              | 4px    |
| `rounded-lg` / `rounded="lg"`             | `rd-lg`           | 8px    |
| `rounded-xl` / `rounded="xl"`             | `rd-3xl`          | 24px   |
| `rounded-pill` / `rounded="pill"`         | `rd-full`         | 9999px |
| `rounded-circle` / `rounded="circle"`     | `rd="50%"`        | 50%    |

- `rd` not `rounded`
- `rd-t-2` not `rounded-t-2`
- `rd-full` not `rounded-full`

**Background (`bg-` prefix):**

- `bg-transparent` not `background-transparent`

**Outline:**

- `outline-none` not `outline-0` (sets `outline: 2px solid transparent`)

When in doubt, prefer the shorter form — UnoCSS abbreviations are canonical in this project.

## Gap Directionality

Use axis-specific gap utilities instead of the omnidirectional `gap-{n}`:

- **`flex` (row)** → `gap-x-{n}` (space between columns only)
- **`flex-col`** → `gap-y-{n}` (space between rows only)
- **`grid` / two-dimensional layouts** → `gap-{n}` (both axes intentional)

Examples:

```html
<!-- flex row of chips/buttons -->
<div flex gap-x-2>...</div>

<!-- flex-col list -->
<div flex flex-col gap-y-1>...</div>

<!-- grid card layout -->
<div grid grid-cols-3 gap-4>...</div>
```

## Absolute Positioning Within a Container

Use `relative` on the parent and `absolute top-0 right-0` (or other corners) to pin UI elements:

```html
<!-- banner with action buttons top-right -->
<div bg-background relative h-20>
  <div absolute top-0 right-0 flex gap-x-1 p-1>
    <slot name="actions" />
  </div>
</div>
```

Prefer this over manual margin/padding tricks when element should float independent of sibling flow.

## Units

- **Always use `rem` instead of `px`** for all CSS values (font sizes, spacing, widths, heights, borders, etc.).

## Style Block

- Use `<style scoped>` — `scoped` is always required.
- Omit `lang="scss"` unless the style block actually uses Sass features (variables, nesting, mixins). Plain CSS does not need it.
