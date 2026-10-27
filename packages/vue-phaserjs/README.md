# vue-phaserjs

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Vue integration for the [Phaser](https://phaser.io) game engine, providing Vue components and composables that bridge Phaser scenes, game objects, and Pinia state with the Vue component lifecycle.

Inspired by [phavuer](https://github.com/laineus/phavuer).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-phaserjs @esposter/shared parse-tmx vue phaser phaser4-rex-plugins pinia
```

Add the type declaration files so scene key types and custom plugins get proper intellisense:

- [`phaser.d.ts`](https://github.com/Esposter/Esposter/blob/main/apps/web/app/types/phaser.d.ts) — narrows scene key types
- [`vue-phaserjs.d.ts`](https://github.com/Esposter/Esposter/blob/main/apps/web/app/types/vue-phaserjs.d.ts) — provides custom plugin types

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/vue-phaserjs) to level up.

### Key Exports

| Export                                                                    | Kind       | Purpose                                                                                             |
| ------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `Game`                                                                    | component  | Starts a Phaser game in its element, and renders its slot once the game is ready                    |
| `onCreate`, `onInit`, `onNextTick`, `onPreload`, `onShutdown`, `onUpdate` | function   | Runs a callback at one stage of a scene's lifecycle, and returns the function that removes it       |
| `Scene`                                                                   | component  | Adds a Phaser scene, starts it when `autoStart` is set, and renders its children while it is active |
| `Sprite`                                                                  | component  | A sprite drawn in the enclosing scene from its configuration                                        |
| `useAnimations`                                                           | composable | Creates a scene's animation frames, and removes them on shutdown or unmount                         |
| `useGame`                                                                 | composable | The Phaser game in the store, which throws until a Game component has created it                    |
| `useTween`                                                                | composable | Sets a tween on a ref, which clears the ref when the tween completes                                |

### Usage

```vue
<script setup lang="ts">
import { Game, Scene, Text } from "vue-phaserjs";
</script>

<template>
  <Game :configuration="{ height: 600, width: 800 }">
    <Scene autoStart sceneKey="menu">
      <Text :configuration="{ style: { fontSize: '32px' }, text: 'Hello', x: 400, y: 300 }" />
    </Scene>
  </Game>
</template>
```

See the reference implementation in [the dungeons page](https://github.com/Esposter/Esposter/blob/main/apps/web/app/pages/dungeons.vue) for a complete example of a Phaser game embedded in a Nuxt/Vue page with Pinia-driven state.

### Features

- Reactive Pinia integration — game state flows naturally through Vue's reactivity system
- Scene lifecycle hooks aligned with Vue's `onMounted` / `onUnmounted`
- TypeScript-first with full generic scene key support
- Vue components wrapping Phaser `Game`, `Scene`, and common game objects

## <a name="commands">⌨️ Commands</a>

Run from `packages/vue-phaserjs/`:

```bash
pnpm build        # compile to dist/
pnpm lint
pnpm lint:fix     # auto-fix lint
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm typecheck    # type check
```

## <a name="related">🔗 Related Documentation</a>

- [Phaser](https://phaser.io/learn)
- [Pinia](https://pinia.vuejs.org/)
- [Vitest](https://vitest.dev/guide/)
- [Vue](https://vuejs.org/guide/introduction.html)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-phaserjs/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-phaserjs/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-phaserjs/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-phaserjs.svg
