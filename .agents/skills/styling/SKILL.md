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

- Vuetify typography: `text-title-large`, `text-headline-small`, `text-body-large`, `text-caption`, etc.
- Vuetify theme colours: `bg-surface`, `bg-background`, `bg-border`, `text-medium-emphasis`, `text-error`, `text-info`, `text-on-surface`, etc.
- Custom theme colours: `bg-surface-opacity-80`, `bg-background-opacity-40`, etc.
- Vuetify border colour utility: `border-color` (when it's the Vuetify utility, not a scoped CSS class name) — use `b-1`, `b-2` etc. instead of `border-sm`, `border-b-sm` (see Abbreviated Utilities below)

### Custom Vuetify theme colours must be registered in `uno.config.ts`

All custom colours not in the standard Vuetify palette (`primary`, `secondary`, `surface`, `background`, `error`, `warning`, `info`, `success`, `on-*`) must be added to `uno.config.ts` under `theme.colors` so UnoCSS can scan and generate them:

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
+ <NuxtInvisibleLink text-primary hover:text-primary-darken-1 transition-colors duration-[var(--transition-duration)] ...>
```

Colons inside attribute names (e.g. `hover:text-primary-darken-1`) are valid in Vue templates — only a leading `:` triggers `v-bind`.

**Do NOT convert** when `v-bind` appears in:

- Structural pseudo-selectors: `:nth-of-type`, `:nth-child`, `:not()`, `:first-of-type`
- `:deep()` rules
- Complex shorthand properties with non-colour reactive values (`animation: ... v-bind(dur)`, `transform: ... v-bind(x)`)
- Non-colour reactive values (`transform`, `top`, `left`, `height`, `fill`, `stroke`)
- Element/tag selectors (`p`, `a`, `ul`, `li`)

## `!important` Variant

Prefix an attribute name with `!` to generate `!important` CSS:

```html
<!-- top: var(--app-bar-height) !important; z-index: 1500 !important -->
<NuxtLoadingIndicator !top="[var(--app-bar-height)]" !z="[1500]" />
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
<UserSideBar sticky top="[calc(1rem+var(--app-bar-height))]" />

<!-- Fixed height with viewport calc -->
<div h="[calc(100vh-3rem)]" overflow-y-auto />

<!-- Arbitrary colour via hex -->
<div bg="[#f0f0f0]" />
```

Spaces inside `calc()` must be omitted or replaced with `_`: `calc(1rem+var(--x))` not `calc(1rem + var(--x))`.

When converting a scoped CSS class that only contains arbitrary-value properties, delete the class name and the `<style scoped>` block entirely.

## Transition Splitting

Split the CSS `transition` shorthand into separate UnoCSS attributes — one for the property, one for the duration:

```html
<!-- Single property + CSS-variable duration: split into two attributes -->
<NuxtInvisibleLink transition-colors duration-[var(--transition-duration)] ...>
  <!-- Multi-property with same static duration: use single arbitrary value (no clean split) -->
  <button transition="[box-shadow_0.2s,transform_0.2s]" ...></button>
</NuxtInvisibleLink>
```

Rules:

- Single known property → use the UnoCSS shorthand (`transition-colors`, `transition-shadow`, `transition-transform`, `transition-opacity`, etc.)
- Override the default duration with a separate `duration-{n}` or `duration-[var(--x)]` attribute
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

Note: `b-1` sets `border-width: 1px`. Always add `b-solid` explicitly — border style is not automatic. For arbitrary widths use `b="[1.5px]"`. For theme-colour borders use `b-text`, `b-border`, `b-info`, `b-error`, `b-transparent`, etc. For the Vuetify overlay border use `b="[rgba(var(--v-border-color),var(--v-border-opacity))]"`.

**`custom-border` / `border-color` scoped-class pattern → attributify:**

```diff
- <div class="custom-border" ...>
+ <div b-1 b-solid b-text ...>

- <style scoped>
- .custom-border { border: var(--border-width) var(--border-style) v-bind(text); }
- </style>
```

`--border-width: thin` = 1px → `b-1`. `--border-style: solid` → `b-solid`. The theme colour (`text`, `border`, `info`, etc.) becomes the `b-*` suffix.

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

- **Always use `rem` instead of `px`** in custom authored CSS values (font sizes, spacing, widths, heights, etc.). Exception: UnoCSS/Vuetify utility scale tokens (`b-1` = 1px, `b-2` = 2px, etc.) are px-mapped by framework design — do not convert them.

## Style Block

- Use `<style scoped>` — `scoped` is always required.
- Omit `lang="scss"` unless the style block actually uses Sass features (variables, nesting, mixins). Plain CSS does not need it.
