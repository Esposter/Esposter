---
name: unocss
description: Apply when editing uno.config.ts, adding new colors/utilities, or choosing between two spellings of one utility. Esposter UnoCSS configuration conventions — the tokens as the theme colours, nothing safelisted, cssLayerName mapping, every template scanned at dev startup, named shortcuts for recurring utility pairs, one canonical spelling per utility family held in the blocklist and reported by unocss/blocklist, and the resolved-config snapshot that catches what a dependency bump changes.
---

# UnoCSS Configuration

## Colours

Two sources, and only two:

- **The UI library's tokens** — `theme.colors` maps every `UiToken` to its own custom property (`var(--ui-accent)`), which Vuetify 0's theme plugin writes per theme, so a `bg-*`, `text-*` or `b-*` utility follows the selected theme at runtime. A new colour is a new token in `UiPaletteMap` (`apps/web/configuration/UiPaletteMap.ts`), never an entry of its own in `uno.config.ts` (the `ui-library` skill).
- **preset-wind4's own palette** (`text-amber`, `bg-sky`), for what no token says. Nothing registers it; it is the preset's.

## Nothing is safelisted

A utility is generated only from what the extractor reads, and a `:class` literal is read like an attribute — `:class="isActive ? 'bg-accent' : 'bg-panel'"` generates both. So a class is written whole in the file that uses it rather than assembled at runtime and safelisted to cover the gap (the `ui-library` skill, `references/icons.md`). A safelist entry would also come back in `matched` from **every** `uno.generate(token)`, whatever the token was, and `apps/web/app/templates.test.ts` asks whether a token is a utility by looking it up in `matched` — so a caller there looks the token up rather than counting the set.

## CSS layer name mapping

```ts
outputToCssLayers: {
  cssLayerName: (layer) => (layer === "properties" ? null : `uno-${layer}`),
}
```

- `properties` → `null` — CSS custom property declarations must not be wrapped in a `@layer` or they lose cascade specificity
- All other layers → `uno-${layer}` (e.g. `default` → `uno-default`, `shortcuts` → `uno-shortcuts`)

Layer declaration order is in `app/assets/css/layers.css`: the document chrome first, then preset-wind4's base and theme, the icons, and the utility layers (`uno-shortcuts`, `uno-default`) last. `uno-icons` sits ahead of the utilities: an icon rule sets `color: inherit`, and a utility colouring an icon has to win over it.

## Every template scanned at startup

`content.filesystem` reads every `.vue` under the Vite root (`app/`, which Nuxt sets as `srcDir`) once at dev startup, and every `.ts` there carrying `@unocss-include` — the glob names `.ts` too, and the pipeline filter drops the rest. Without it the dev stylesheet holds only the utilities of the modules transformed so far, so a page first reached by client navigation, or a component behind `<ClientOnly>`, renders unstyled until a reload — padding, gaps and max widths missing while scoped styles apply, or a menu item whose icon only a composable names drawn without it. A layout that is wrong in dev and right after a reload is this, never a CSS bug; the scan stays even though a production build already sees the whole graph.

## Shortcuts for recurring utility pairs

When the same attributify utility combination recurs across components, define a named shortcut in `uno.config.ts` and use it everywhere instead of the raw pair, as the library's `ui-*` shortcuts do. Update the snapshot below after adding one.

## One spelling per utility — the blocklist

`presetWind4` accepts an alias for most of what it generates — `pa-4` beside `p-4`, `border-2` beside `b-2`,
`rounded-lg` beside `rd-lg`, `fw-bold` beside `font-bold`, `color-white` beside `text-white` — so the same style
can be written several ways across the tree. **`BLOCKED_SPELLINGS` in `uno.config.ts` is the single source of
truth for which spelling is canonical**: each entry refuses one alias family and names what to write instead.
The generator honours it by emitting nothing for a blocked token, and `unocss/blocklist` (on in the shared ESLint
config) reports the attribute or `class` literal that wrote one, with the message. A string inside a `:class`
expression is out of the rule's reach, so `app/templates.test.ts` checks those against the same list. A new alias found in the tree
joins the list rather than the prose.

**Blocking a spelling is a render change, so it owes `pnpm test app/App.test.ts -u --run`.** The attribute
survives into the rendered markup, and the committed HTML under `apps/web/app/__snapshots__/` is the only place
that still holds the old one — no linter reads a snapshot, so the rewrite of the components passes every check
and the suite goes red on a file the change never touched. It has landed that way twice, once per blocked
family, which is why it is a step here rather than a thing to notice.

## The resolved-config snapshot

`apps/web/uno.config.test.ts` snapshots the resolved configuration.

**It is not there to restate what the config file sets** — that would fail only on a deliberate edit, where the
diff is already the review. It is there for the edit nobody makes: **an `unocss` bump**. The snapshot captures
_resolved_ output — what the preset fills in around our entries — so an upstream release can move it with no diff
anywhere in this repo and nothing else in the suite would notice. That is the "a literal fixed outside this repo"
case the `testing` skill carves out, and it is why a version bump is the review that matters for this file.

So the diff on a dependency update is the finding, not noise: read it before regenerating, and say in the commit
what upstream changed. Regenerate after an intentional change of our own:

```bash
pnpm test uno.config.test.ts -u --run
```
