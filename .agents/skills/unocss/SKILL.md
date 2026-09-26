---
name: unocss
description: Apply when editing uno.config.ts, adding a colour, utility or shortcut, choosing between two spellings of one utility, or when a utility generates nothing or loses to another rule. Esposter UnoCSS configuration — theme colours, extraction, layers, the blocklist and the resolved-config snapshot.
---

# UnoCSS Configuration

## Colours

Two sources, and only two:

- **The UI library's tokens** — `theme.colors` maps every `UiToken` to its own custom property (`var(--ui-accent)`), which Vuetify 0's theme plugin writes per theme, so a `bg-*`, `text-*` or `b-*` utility follows the selected theme at runtime. A new colour is a new token in `UiPaletteMap` (`apps/web/configuration/UiPaletteMap.ts`), never an entry of its own in `uno.config.ts` (the `ui-library` skill).
- **preset-wind4's own palette** (`text-amber`, `bg-sky`), for what no token says. Nothing registers it; it is the preset's.

## Nothing is safelisted

A utility is generated only from what the extractor reads, and a `:class` literal is read like an attribute — `:class="isActive ? 'bg-accent' : 'bg-panel'"` generates both. So a class is written whole in the file that uses it rather than assembled at runtime and safelisted to cover the gap (the `ui-library` skill, `references/icons.md`). A safelist entry would also come back in `matched` from **every** `uno.generate(token)`, whatever the token was, and `apps/web/app/templates.test.ts` asks whether a token is a utility by looking it up in `matched` — so a caller there looks the token up rather than counting the set.

## CSS layer name mapping

Every layer but `properties` is `uno-<layer>`, and `app/assets/css/layers.css` orders them chrome first, utilities last (`references/css-layers.md`).

## Every template scanned at startup

Every `.vue` under `app/`, and every `.ts` carrying `@unocss-include`, is scanned at dev startup, and a template comment is blanked before attributify reads it (`references/extraction.md`).

## Shortcuts for recurring utility pairs

When the same attributify utility combination recurs across components, define a named shortcut in `uno.config.ts` and use it everywhere instead of the raw pair, as the library's `ui-*` shortcuts do. Adding one moves the resolved-config snapshot (`references/config-snapshot.md`).

## One spelling per utility — the blocklist

`BLOCKED_SPELLINGS` in `uno.config.ts` is the one source of which spelling is canonical — `unocss/blocklist` reports the rest — and blocking one owes `pnpm test app/App.test.ts -u --run` (`references/blocklist.md`).

## The resolved-config snapshot

`uno.config.test.ts` snapshots the resolved config so an `unocss` bump shows what upstream moved — read the diff before regenerating (`references/config-snapshot.md`).

## Reference pages

- `references/css-layers.md` — when changing the layer mapping, or a utility loses to a rule it should beat.
- `references/extraction.md` — when dev styling differs from a reload, a `.ts` names a utility, or a comment seems to break an attribute.
- `references/blocklist.md` — when two spellings of a utility both work, or one is being blocked.
- `references/config-snapshot.md` — when `uno.config.test.ts` fails, most of all after a bump.
