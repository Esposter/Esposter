---
name: unocss
description: Esposter UnoCSS configuration conventions — theme colors registration, safelist rules for dynamic Vuetify color props, cssLayerName mapping, and regression snapshot tests. Apply when editing uno.config.ts or adding new colors/utilities.
---

# UnoCSS Configuration

> Attributify **template syntax** (valued attributes, negatives, `!important`) lives in the `styling` skill, not here. This file is config only.

## Color Architecture

Two systems provide color utilities:

| System             | Controls                                                            | Configured in                          |
| ------------------ | ------------------------------------------------------------------- | -------------------------------------- |
| Vuetify color pack | Material Design palette (`text-amber`, `bg-deep-purple`, etc.)      | `$color-pack: true` in `settings.scss` |
| UnoCSS             | Custom theme colors (`text-primary`, `bg-surface-opacity-80`, etc.) | `uno.config.ts`                        |

`$color-pack: true` (in `app/assets/css/settings.scss`) makes Vuetify's SCSS generate all palette utility classes automatically. **Do not register palette colors in `uno.config.ts`** — already covered.

## Theme colors

Custom theme colors from `vuetify.config.ts` are auto-derived in `uno.config.ts` via `allColorKeys` (base + variations). Vuetify's runtime injects `--v-theme-{color}` variables; UnoCSS maps them to `rgb(var(--v-theme-{color}))` for attributify utilities. Adding a color to `vuetify.config.ts` is all that's needed.

## Why theme colors must still be safelisted

Theme colors appear in dynamic `:class` bindings that UnoCSS's scanner can't detect at build time:

```ts
// UnoCSS can't see "bg-primary"/"bg-surface" here at scan time
:class="isActive ? 'bg-primary' : 'bg-surface'"
```

The safelist forces UnoCSS to generate `.bg-{key}`/`.text-{key}` for all theme colors unconditionally:

```ts
safelist: [...allColorKeys.flatMap((key) => [`bg-${key}`, `text-${key}`])];
```

Palette colors are resolved by Vuetify's color pack CSS — no UnoCSS safelisting needed.

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

`packages/app/uno.config.test.ts` snapshots `rules`, `safelist`, `shortcuts`, and `theme`, and separately tests the `cssLayerName` function. Run it to update the snapshots after intentional changes:

```bash
pnpm exec vitest run uno.config.test.ts -u
```

Update the snapshot whenever:

- A new theme color is added to `vuetify.config.ts`
- A new rule, shortcut, or opacity utility is added to `uno.config.ts`
