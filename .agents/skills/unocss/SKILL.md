---
name: unocss
description: Esposter UnoCSS configuration conventions — theme colors registration, safelist rules for dynamic Vuetify color props, cssLayerName mapping, and regression snapshot tests. Apply when editing uno.config.ts or adding new colors/utilities.
---

# UnoCSS Configuration

## Color Architecture

Two systems provide color utilities in this project:

| System             | Controls                                                            | Configured in                          |
| ------------------ | ------------------------------------------------------------------- | -------------------------------------- |
| Vuetify color pack | Material Design palette (`text-amber`, `bg-deep-purple`, etc.)      | `$color-pack: true` in `settings.scss` |
| UnoCSS             | Custom theme colors (`text-primary`, `bg-surface-opacity-80`, etc.) | `uno.config.ts`                        |

`$color-pack: true` is set in `app/assets/css/settings.scss`. Vuetify's SCSS compilation generates all Material Design palette utility classes automatically. **Do not register palette colors in `uno.config.ts`** — they are already covered.

## Theme colors

Custom theme colors from `vuetify.config.ts` are auto-derived in `uno.config.ts` via `allColorKeys` (base colors + variations). Vuetify's runtime injects `--v-theme-{color}` CSS variables; UnoCSS maps these to `rgb(var(--v-theme-{color}))` for use as attributify utilities.

Adding a color to `vuetify.config.ts` is all that's needed — `uno.config.ts` picks it up automatically.

## Why theme colors must still be safelisted

Vuetify resolves a custom theme `color` prop by adding a CSS class to the element (e.g. `color="primary-darken-1"` → adds `text-primary-darken-1`). Since UnoCSS cannot detect these dynamic prop values at scan time, all theme color utilities are explicitly safelisted:

```ts
safelist: [...allColorKeys.flatMap((key) => [`bg-${key}`, `text-${key}`])];
```

Material Design palette colors (e.g. `color="amber"`) are resolved by Vuetify's color pack CSS — they do not need UnoCSS safelisting.

## CSS layer name mapping

```ts
outputToCssLayers: {
  cssLayerName: (layer) => (layer === "properties" ? null : `uno-${layer}`),
}
```

- `properties` → `null` — CSS custom property declarations must not be wrapped in a `@layer` or they lose cascade specificity
- All other layers → `uno-${layer}` (e.g. `default` → `uno-default`, `shortcuts` → `uno-shortcuts`)

Layer declaration order is in `app/assets/css/layers.css`. All `uno-*` layers appear after the `vuetify-*` layers so UnoCSS utilities can override Vuetify defaults.

## Snapshot test

`packages/app/uno.config.test.ts` snapshots `rules`, `safelist`, `shortcuts`, and `theme`, and separately tests the `cssLayerName` function. Run with `--run -u` to update after intentional changes:

```bash
pnpm test uno.config.test.ts -- --run -u
```

Update the snapshot whenever:

- A new theme color is added to `vuetify.config.ts`
- A new rule, shortcut, or opacity utility is added to `uno.config.ts`
