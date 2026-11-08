# genshin-interface

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Genshin Impact's interface as a fan recreation. It provides the game's own screen units, face and pointer, and its buttons, dividers, bars and notices, as presentational Vue components.

It is an unofficial, non-commercial fan work. It is not affiliated with HoYoverse. It ships no image or font from the game. Each glyph is a vector path, traced from the game's own. The face is the open face nearest to the game's.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/genshin/interface-library).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i genshin-interface vue
```

1. Draw each screen inside `GameScreen`.
2. Lay out each screen in `calc(var(--unit) * n)`.

Each component brings its own stylesheet, so a bundler loads the styles of the components you import and no more.

```vue
<script setup lang="ts">
import { GameScreen, InterfaceIcon, RoundButton } from "genshin-interface";
</script>

<template>
  <GameScreen>
    <RoundButton :icon="InterfaceIcon.Exit" label="Exit" />
  </GameScreen>
</template>
```

## <a name="key-exports">🧩 Key Exports</a>

| Export              | Kind      | Purpose                                                                                       |
| ------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `GameScreen`        | component | The root of every game screen, with its 1920 by 1080 unit, face and pointer                   |
| `InterfaceClip`     | interface | One interface animation clip of the game, with a span and a track for each property it moves  |
| `InterfaceIcon`     | enum      | The glyphs that the round buttons show                                                        |
| `LoadingSpinner`    | component | The game's wait mark, with a label for a screen reader                                        |
| `OrnamentDivider`   | component | The game's divider: a hairline with diamonds at its ends, and a middle ornament unless hidden |
| `playInterfaceClip` | function  | Plays a clip on a screen with Web Animations, and returns the animations to await or seek     |
| `ProgressBar`       | component | The game's progress bar, filled from 0 to 1                                                   |
| `PromptBand`        | component | The band that holds a prompt, across the foot of a screen                                     |
| `RoundButton`       | component | The game's round button, with a glyph and a label for a screen reader                         |
| `ToastNotice`       | component | The game's notice card, dropped at the top of a screen                                        |

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-interface/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-interface/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-interface/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-interface.svg
