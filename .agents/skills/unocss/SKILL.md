---
name: unocss
description: Esposter UnoCSS configuration conventions — theme colors registration, safelist rules for dynamic Vuetify color props, cssLayerName mapping, named shortcuts for recurring utility pairs, and the resolved-config snapshots that catch what a dependency bump changes. Apply when editing uno.config.ts or adding new colors/utilities.
---

# UnoCSS Configuration

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

## Shortcuts for recurring utility pairs

When the same attributify utility combination recurs across components (e.g. `op-medium-emphasis text-body-small` for hint text), define a named shortcut in `uno.config.ts` (`"text-hint": "op-medium-emphasis text-body-small"`) and use it everywhere instead of the raw pair. Update the snapshot below after adding one.

## The resolved-config snapshots

`packages/app/uno.config.test.ts` snapshots `rules`, `safelist`, `shortcuts` and `theme`;
`packages/app/vuetify.config.test.ts` snapshots the whole Vuetify configuration.

**They are not there to restate what the config file sets** — that would fail only on a deliberate edit, where
the diff is already the review. They are there for the edit nobody makes: **a `vuetify` or `unocss` bump**. Both
snapshots capture _resolved_ output — the elevation rules and theme colours UnoCSS derives from Vuetify's
palette, and the defaults Vuetify's own `defineVuetifyConfiguration` fills in around ours — so an upstream
release can move them with no diff anywhere in this repo and nothing else in the suite would notice. That is the
"a literal fixed outside this repo" case the `testing` skill carves out, and it is why a version bump is the
review that matters for these two files.

So the diff on a dependency update is the finding, not noise: read it before regenerating, and say in the commit
what upstream changed. Regenerate after an intentional change of our own:

```bash
pnpm test uno.config.test.ts vuetify.config.test.ts -u --run
```
