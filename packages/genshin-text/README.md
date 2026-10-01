# genshin-text

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Genshin Impact's own text in its fifteen languages, as an unofficial, non-commercial fan work and not affiliated with HoYoverse:

- the game's languages, each with its BCP-47 tag and its own name for itself;
- `matchGameLanguage`, the game language nearest a reader's browser locale or `Accept-Language` header;
- every string the package references, looked up by the game's own text id, with English bundled and every other language a chunk loaded on first use.

Nothing is translated by hand: each string is the game's own, in the game's own translation.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i genshin-text
```

Pick the reader's language, load its text once, and index it by key:

```ts
import { GameTextKey, GameTextLoaderMap, matchGameLanguage } from "genshin-text";

const language = matchGameLanguage(navigator.languages);
const gameText = await GameTextLoaderMap[language]();
console.log(gameText[GameTextKey.Loading]);
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/genshin-text.html) to level up. Where the text comes from and how a new string is referenced is its [docs page](https://esposter.com/docs/genshin/game-text).

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-text/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-text/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-text/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-text.svg
