---
name: genshin-text
description: Apply when showing any of Genshin Impact's own words in the app, a Genshin package or the persona plugin, adding a GameTextKey, choosing a reader's game language, or touching packages/genshin-text, scripts/src/services/genshinText, or the persona's src/generated copy. Esposter's game text — the game's strings in its fifteen languages, referenced by the game's own text id and never translated by hand, generated from a dump kept outside the repository.
---

# Genshin Text

How it works, from the dump to a lookup, is `apps/web/content/docs/genshin/game-text.md`; this skill is the rules a change that shows the game's words follows.

## Settled — do not re-propose

- **Translating a string the game already says, or an i18n library for it.** The game ships its own translation in fifteen languages; a consumer's own words go in its own typed module — the persona's are `apps/web/content/docs/infra/claude-interface/persona-plugin.md`'s, which also records why a keyed library lost to a typed function per string.
- **Shipping a whole text map, or loading one at run time.** It runs to tens of megabytes per language, and neither a browser nor a stranger's plugin install has the dump; the referenced subset is the only shippable shape.
- **`genshin-text` as a dependency of the persona plugin.** The plugin's frozen npm lockfile would disagree with every release that moves the range; the modules it runs are a generated copy (`apps/web/content/docs/infra/claude-interface/persona-plugin.md`).
- **A `t(key)` function over the lookup.** The lookup is indexing a loaded chunk, `gameText[GameTextKey.X]`, and syntax is never wrapped (the `over-engineering` skill, `references/syntax-extraction.md`).

## Rules

- **A word the game says is `gameText[GameTextKey.X]`, never a literal** — search the text map with `find` before deciding the game does not say it: nearly all of what the opening shows before the client loads is there, some of it worded per platform or per gender. What the account kit shows as the player signs in is in the kit's own strings, which `write` reads beside the text map by the kit's key.
- **A screen that shows a word takes `gameText` as a required prop** from the host that resolved the language, never by injection and never with English as a default, so a host that forgets it fails to compile; a fixture passes `ENGLISH_GAME_TEXT`.
- **A key's value is the game's own id** — the manual text map's name for an interface string, else the raw hash — found with `pnpm -C scripts genshin:text find "<pattern>"` and written with `pnpm -C scripts genshin:text write`; a key is one line in `packages/genshin-text/src/models/GameTextKey.ts` and nothing else lists it.
- **`src/generated/` is the writer's alone, in both packages.** Its output is never formatted (`oxfmt.config.ts` ignores `**/generated/**`), and `scripts/src/services/genshinText/getPersonaModuleSource.test.ts` fails the day the persona's copy and its source disagree, so a change to a copied module is followed by a `write`.
- **A module the persona copies imports only from its own package**, since the copy re-aims `#src/` and the plugin's install carries nothing else; `matchGameLanguage` stays out of `PersonaCopiedModules` for that reason (`scripts/src/services/genshinText/constants.ts`).
- **A reader's language comes from `matchGameLanguage`, and a language's tag from `GameLanguageTagMap`** — never a locale table of a consumer's own.
- **A language is never a location.** Nothing but text is chosen by the reader's language: whether a third party works for them is asked of their network (`apps/web/content/docs/architecture/third-party-reachability.md`).
- **A persona string the game already says comes from the game text**, and a localization module holds only phrasing the game never says.
