---
name: genshin-text
description: Apply when showing any of Genshin Impact's own words in the app, a Genshin package or the persona plugin, adding a GameTextKey, choosing a reader's game language, or touching packages/genshin-text, scripts/src/services/genshinText, or the persona's src/generated copy. Esposter's game text — the game's strings in every language it ships, referenced by the game's own text id and never translated by hand, generated from the game's text kept outside the repository, its text maps decoded from the installed client and its tables from a dump.
---

# Genshin Text

How it works, from the dump to a lookup, is `openspec/specs/genshin/game-text/design.md`; this skill is the rules a change that shows the game's words follows.

## Settled — do not re-propose

- **Translating a string the game already says, or an i18n library for it** — `references/settled-directions.md`.
- **Shipping a whole text map, or loading one at run time** — `references/settled-directions.md`.
- **`genshin-text` as a dependency of the persona plugin** — `references/settled-directions.md`.
- **A `t(key)` function over the lookup** — `references/settled-directions.md`.

## Rules

- **A word the game says is `gameText[GameTextKey.X]`, never a literal** — search the text map with `find` before deciding the game does not say it: nearly all of what the opening shows before the client loads is there, some of it worded per platform or per gender (`references/finding-and-writing-keys.md`).
- **A label only a screen reader says is a word too**: an `aria-label` and a glyph button's `label` are read from the game text like any drawn word, so a reader hears their own language; a brand's name or a number stays as it is.
- **A screen that shows a word takes `gameText` as a required prop** from the host that resolved the language, never by injection and never with English as a default, so a host that forgets it fails to compile; a fixture passes `ENGLISH_GAME_TEXT` (`references/passing-game-text.md`).
- **A string's colour tags are split by `splitGameTextColors`**, never stripped or matched by hand: `write` keeps them in every chunk (`getInterfaceGameText`), each run keeps the CSS colour its `<color=#RRGGBBAA>` or `<color=#RRGGBB>` tag gives it, and a screen draws a run as a `span` (a `tspan` inside an SVG) with that colour.
- **A string's numbered values (`{0}`, `{1}`) are filled by `fillGameTextValues(text, ...values)`**, never a chain of `.replace` calls: it fills every number at once and takes a value holding a replacement pattern (`$&`) as it is.
- **A key's value is the game's own id** — the manual text map's name for an interface string, else the raw hash — found with `pnpm -C scripts genshin:text find "<pattern>"`, or from the string as the game shows it with `pnpm -C scripts genshin:text reverse "<shown text>"` (the member that already takes it and each language's text, `--languages` and `--json`), or by the screen's shared manual-id prefix with `find --id "^UI_FORGE_PAGE_"` when its words (Start, Materials) are too common to search for and written with `pnpm -C scripts genshin:text write`; a key is one line in `packages/genshin-text/src/models/GameTextKey.ts` and nothing else lists it (`references/finding-and-writing-keys.md`).
- **`write` and `quests` read their inventory through each package's built `dist`**, since `vpx` resolves imports as Node does, with no `source` condition: a new `GameTextKey` or `QuestId` is built first (`pnpm exec tsdown --no-clean` in its package), or the run writes the inventory as it last built.
- **The world's own words are records, never a `GameTextKey`**: a quest's, an achievement's, an Archive entry's and the card game's text is published per language and read by the screen that shows it (`references/published-text-records.md`).
- **A book's body is read from `Readable/`, not a text map** — `references/the-dump.md`.
- **A table the dump lacks is fetched, never committed** — `references/the-dump.md`.
- **A character's, a weapon's, an enemy kind's or a recipe's name is the world's, never a `GameTextKey`** — `references/name-records.md`.
- **An item's name is its `nameTextId` through the name records; a `GameTextKey` is a string the code names** — `references/name-records.md`.
- **`src/generated/` is the writer's alone, in both packages** — `references/generated-copies.md`.
- **A module the persona copies imports only from its own package**, since the copy re-aims `#src/` and the plugin's install carries nothing else; `matchGameLanguage` stays out of `PersonaCopiedModules` for that reason (`scripts/src/services/genshinText/constants.ts`).
- **A reader's language comes from `matchGameLanguage`, and a language's tag from `GameLanguageTagMap`** — never a locale table of a consumer's own.
- **A language is never a location** — `references/reader-language.md`.
- **A persona string the game already says comes from the game text**, and a localization module holds only phrasing the game never says.

## Reference pages

- `references/finding-and-writing-keys.md` — when a game word's key is found in the text map, or a key is added to `GameTextKey` and written.
- `references/published-text-records.md` — when a quest's, an achievement's, an Archive entry's or the card game's words are published as a record.
- `references/passing-game-text.md` — when a screen shows a word and takes `gameText`, or a `genshin-interface` piece needs its words.
- `references/the-dump.md` — when a table, text map or `Readable` folder is missing from the dump, or a book body is published.
- `references/name-records.md` — when an item, character, enemy or recipe name is published as a record or shown.
- `references/generated-copies.md` — when a file under `src/generated` is written, or a module the persona copies is changed.
- `references/reader-language.md` — when a reader's language is matched, or a language is taken as a location.
- `references/settled-directions.md` — when a proposal matches a Settled line and its full statement is needed.
