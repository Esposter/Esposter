# genshin-text

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Genshin Impact's own text in its fifteen languages, as an unofficial, non-commercial fan work and not affiliated with HoYoverse.

Nothing is translated by hand: each string is the game's own, in the game's own translation.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i genshin-text
```

Pick the reader's language, load its text once, and index it by key:

```ts
import { GameTextKey, GameTextLoaderMap, matchGameLanguage } from "genshin-text";

const language = matchGameLanguage(window.navigator.languages);
const gameText = await GameTextLoaderMap[language]();
console.log(gameText[GameTextKey.Loading]);
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/blob/main/openspec/specs/genshin/game-text/design.md) to level up. It explains where the text comes from and how to reference a new string.

- every string the package references, looked up by the game's own text id, with English bundled and every other language a chunk loaded on first use;
- `matchGameLanguage`, the game language nearest a reader's browser locale or `Accept-Language` header;
- the game's languages, each with its BCP-47 tag and its own name for itself.

### Key Exports

| Export                   | Kind      | Purpose                                                                                        |
| ------------------------ | --------- | ---------------------------------------------------------------------------------------------- |
| `fillGameTextValues`     | function  | Fills a string's numbered placeholders with the values given, keeping any with no value        |
| `GameLanguage`           | enum      | The fifteen languages the game is written in                                                   |
| `GameText`               | type      | Every referenced string in one language, keyed by `GameTextKey`                                |
| `GameTextKey`            | enum      | Every string a consumer shows, by the game's own text id                                       |
| `GameTextLoaderMap`      | const     | Loads one language's `GameText`: English bundled, every other language a chunk on first use    |
| `GameTextSegment`        | interface | A run of a game string under one colour, or plain when it has none                             |
| `getAcceptLanguageTags`  | function  | The tags of an `Accept-Language` header, most preferred first, weighed by their `q`            |
| `getLanguageDisplayName` | function  | A game language's name as written in another game language, or as given when either is not one |
| `matchGameLanguage`      | function  | The game language nearest a list of preferred tags, English when none matches                  |
| `splitGameTextColors`    | function  | Splits a game string into plain runs and colour-tagged runs                                    |

## <a name="commands">⌨️ Commands</a>

Run from `packages/genshin-text/`:

```bash
pnpm build        # tsdown
pnpm lint         # lint the package
pnpm lint:fix     # eslint --fix
pnpm test         # vitest watch mode
pnpm typecheck    # tsrs --fast
```

## <a name="related">🔗 Related Documentation</a>

- [tsdown](https://tsdown.dev/)
- [Vitest](https://vitest.dev/guide/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-text/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-text/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-text/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-text.svg
