# genshin-interface

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Genshin Impact's interface, rebuilt as an unofficial, non-commercial fan work and not affiliated with HoYoverse. It holds the pieces every screen of the game's is made from, as presentational Vue components:

- `GameScreen`, the root a screen is drawn in: the game's 1920 by 1080 unit, its face and its pointer;
- its round buttons and their glyphs, the server bar, the progress bar, the prompt band, the notice card, the wait mark and the ornamented divider.

It ships no image or font from the game: each glyph is a vector path traced from the game's own, and the face is the open one nearest it.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
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

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/genshin-interface.html) to level up. How the library is measured against the game is its [docs page](https://esposter.com/docs/genshin/interface-library).

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/genshin-interface/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/genshin-interface/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/genshin-interface/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/genshin-interface.svg
