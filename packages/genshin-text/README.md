# genshin-text

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Genshin Impact's own text in its fifteen languages. It is an unofficial, non-commercial fan work. It is not affiliated with HoYoverse.

No string is translated by hand. Each string is the game's own, in the game's own translation.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/genshin/game-text).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i genshin-text
```

1. Pick the reader's language with `matchGameLanguage`. Pass in the browser's language list.
2. Load that language's text once with `GameTextLoaderMap`.
3. Index the text with a `GameTextKey` value.

```ts
import { GameTextKey, GameTextLoaderMap, matchGameLanguage } from "genshin-text";

const language = matchGameLanguage(window.navigator.languages);
const gameText = await GameTextLoaderMap[language]();
console.log(gameText[GameTextKey.Loading]);
```

Check: the console shows the loading string in the reader's language, or in English when no language of the fifteen matches.

## <a name="key-exports">🧩 Key Exports</a>

| Export                   | Kind      | Purpose                                                                                                              |
| ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------- |
| `fillGameTextValues`     | function  | Fills a string's numbered placeholders with the values given, and keeps each placeholder that has no value           |
| `GameLanguage`           | enum      | The fifteen languages of the game                                                                                    |
| `GameText`               | type      | Every referenced string in one language, keyed by `GameTextKey`                                                      |
| `GameTextKey`            | enum      | Every string that a consumer shows, by the game's own text id                                                        |
| `GameTextLoaderMap`      | const     | Loads one language's `GameText`: English is bundled, and each other language is a chunk loaded on first use          |
| `GameTextSegment`        | interface | A run of a game string under one colour, or plain when it has none                                                   |
| `getAcceptLanguageTags`  | function  | The tags of an `Accept-Language` header, most preferred first, weighed by their `q`                                  |
| `getLanguageDisplayName` | function  | A game language's name, as written in another game language, or the name as given when either is not a game language |
| `matchGameLanguage`      | function  | The game language nearest to a list of preferred tags, or English when none matches                                  |
| `splitGameTextColors`    | function  | Splits a game string into plain runs and colour-tagged runs                                                          |

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-text/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-text/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-text/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-text.svg
