---
name: unocss
description: Apply when editing uno.config.ts, adding new colors/utilities, or choosing between two spellings of one utility. Esposter UnoCSS configuration conventions — theme colors registration, safelist rules for dynamic Vuetify color props, cssLayerName mapping, every template scanned at dev startup, named shortcuts for recurring utility pairs, one canonical spelling per utility family held in the blocklist and reported by unocss/blocklist, and the resolved-config snapshots that catch what a dependency bump changes.
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

Two sources, merged in `uno.config.ts`'s `theme.colors`, the second winning on a shared name:

- **The UI library's tokens** — every `UiToken` maps to its own custom property ("var(--ui-accent)"), which Vuetify 0's theme plugin writes per theme. A new colour is a new token in `UiPaletteMap` (`apps/web/configuration/UiPaletteMap.ts`), never a new Vuetify colour (the `ui-library` skill).
- **Vuetify's colour names** — derived via `allColorKeys` (base + variations) and mapped to `rgb(var(--v-theme-{color}))`, kept only while unmigrated templates still write `primary`, `surface`, `border` and their opacity keys. Vuetify's base colours are themselves built from the palette, so the two agree.

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

Every safelisted utility comes back in `matched` from **any** `uno.generate(token)`, whatever the token was, so a
caller asking whether a token is a utility looks the token up in `matched` rather than counting the set —
`matched.size` is never zero against this config, and a check written on the count passes on every input.
`apps/web/app/templates.test.ts` is the caller that asks.

## CSS layer name mapping

```ts
outputToCssLayers: {
  cssLayerName: (layer) => (layer === "properties" ? null : `uno-${layer}`),
}
```

- `properties` → `null` — CSS custom property declarations must not be wrapped in a `@layer` or they lose cascade specificity
- All other layers → `uno-${layer}` (e.g. `default` → `uno-default`, `shortcuts` → `uno-shortcuts`)

Layer declaration order is in `app/assets/css/layers.css`. The utility layers (`uno-shortcuts`, `uno-default`) appear after the `vuetify-*` layers so UnoCSS utilities can override Vuetify defaults. `uno-icons` sits ahead of Vuetify's: an icon rule sets `color: inherit`, and a component colouring its own icon has to win over it.

## Every template scanned at startup

`content.filesystem` reads every `.vue` under the Vite root (`app/`, which Nuxt sets as `srcDir`) once at dev startup. Without it the dev stylesheet holds only the utilities of the modules transformed so far, so a page first reached by client navigation, or a component behind `<ClientOnly>`, renders unstyled until a reload — padding, gaps and max widths missing while scoped styles apply. A layout that is wrong in dev and right after a reload is this, never a CSS bug; the scan stays even though a production build already sees the whole graph.

## Shortcuts for recurring utility pairs

When the same attributify utility combination recurs across components (e.g. `op-medium-emphasis text-body-small` for hint text), define a named shortcut in `uno.config.ts` (`"text-hint": "op-medium-emphasis text-body-small"`) and use it everywhere instead of the raw pair. Update the snapshot below after adding one.

## One spelling per utility — the blocklist

`presetWind4` accepts an alias for most of what it generates — `pa-4` beside `p-4`, `border-2` beside `b-2`,
`rounded-lg` beside `rd-lg`, `fw-bold` beside `font-bold`, `color-white` beside `text-white` — so the same style
can be written several ways across the tree. **`BLOCKED_SPELLINGS` in `uno.config.ts` is the single source of
truth for which spelling is canonical**: each entry refuses one alias family and names what to write instead.
The generator honours it by emitting nothing for a blocked token, and `unocss/blocklist` (on in the shared ESLint
config) reports the attribute or `class` literal that wrote one, with the message. A new alias found in the tree
joins the list rather than the prose; a bare `rounded` or `border` stays off it because on a Vuetify component
each is that component's own prop, and the rule reads every valueless attribute.

**Blocking a spelling is a render change, so it owes `pnpm test app/App.test.ts -u --run`.** The attribute
survives into the rendered markup, and the committed HTML under `apps/web/app/__snapshots__/` is the only place
that still holds the old one — no linter reads a snapshot, so the rewrite of the components passes every check
and the suite goes red on a file the change never touched. It has landed that way twice, once per blocked
family, which is why it is a step here rather than a thing to notice.

## The resolved-config snapshots

`apps/web/uno.config.test.ts` snapshots `rules`, `safelist`, `shortcuts` and `theme`;
`apps/web/vuetify.config.test.ts` snapshots the whole Vuetify configuration.

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
