# genshin-interface

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Genshin Impact's interface as a fan recreation: the game's own screen units, face and pointer, and its buttons, dividers, bars and notices as presentational Vue components.

It is an unofficial, non-commercial fan work, not affiliated with HoYoverse. It ships no image or font from the game: each glyph is a vector path traced from the game's own, and the face is the open one nearest it.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i genshin-interface vue
```

Draw a screen inside `GameScreen`, lay it out in `calc(var(--unit) * n)`, and load the styles once:

```vue
<script setup lang="ts">
import { GameScreen, InterfaceIcon, RoundButton } from "genshin-interface";
import "genshin-interface/style.css";
</script>

<template>
  <GameScreen>
    <RoundButton :icon="InterfaceIcon.Exit" label="Exit" />
  </GameScreen>
</template>
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/blob/main/openspec/specs/genshin/interface-library/design.md) to level up. It compares the library against the game.

It holds the pieces every screen of the game's is made from, as presentational Vue components:

- `GameScreen`, the root a screen is drawn in: the game's 1920 by 1080 unit, its face and its pointer;
- its round buttons and their glyphs, the server bar, the progress bar, the prompt band, the notice card, the wait mark and the ornamented divider.

### Key Exports

| Export              | Kind      | Purpose                                                                                  |
| ------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `GameScreen`        | component | The root every screen of the game is drawn in: its 1920 by 1080 unit, face and pointer   |
| `InterfaceClip`     | interface | One of the game's interface animation clips: a span and a track per property it moves    |
| `InterfaceIcon`     | enum      | The glyphs the round buttons wear                                                        |
| `LoadingSpinner`    | component | The game's wait mark, labelled for a screen reader                                       |
| `OrnamentDivider`   | component | The game's ornamented divider: a hairline with diamonds at its ends and its middle       |
| `playInterfaceClip` | function  | Plays a clip on a screen with Web Animations and returns the animations to await or seek |
| `ProgressBar`       | component | The game's progress bar, filled from 0 to 1                                              |
| `PromptBand`        | component | The band a prompt is set in across the foot of a screen                                  |
| `RoundButton`       | component | The game's round button with a glyph, labelled for a screen reader                       |
| `ToastNotice`       | component | The game's notice card, dropped at the top of a screen                                   |

## <a name="commands">⌨️ Commands</a>

Run from `packages/genshin-interface/`:

```bash
pnpm build           # tsdown
pnpm lint            # lint the package
pnpm lint:fix        # eslint --fix
pnpm test            # vitest watch mode
pnpm test:visual     # vitest, browser config
pnpm typecheck       # tsrs --fast --runExternalCode
```

## <a name="related">🔗 Related Documentation</a>

- [tsdown](https://tsdown.dev/)
- [Vitest](https://vitest.dev/guide/)
- [Vue](https://vuejs.org/guide/introduction.html)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-interface/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-interface/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-interface/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-interface.svg
