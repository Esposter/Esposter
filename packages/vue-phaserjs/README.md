# vue-phaserjs

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Inspired by [phavuer](https://github.com/laineus/phavuer).

Vue 3 integration for the [Phaser 4](https://phaser.io) game engine. Provides Vue components and composables that bridge Phaser scenes, game objects, and Pinia state with the Vue component lifecycle.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-phaserjs @esposter/shared parse-tmx vue phaser phaser4-rex-plugins pinia
```

Add the type declaration files so scene key types and custom plugins get proper intellisense:

- [`phaser.d.ts`](https://github.com/Esposter/Esposter/blob/main/packages/app/app/types/phaser.d.ts) — narrows scene key types
- [`vue-phaserjs.d.ts`](https://github.com/Esposter/Esposter/blob/main/packages/app/app/types/vue-phaserjs.d.ts) — provides custom plugin types

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/modules/vue-phaserjs.html) to level up.

### Usage

See the reference implementation in [`packages/app/app/pages/dungeons.vue`](https://github.com/Esposter/Esposter/blob/main/packages/app/app/pages/dungeons.vue) for a complete example of a Phaser game embedded in a Nuxt/Vue page with Pinia-driven state.

### Features

- Vue components wrapping Phaser `Game`, `Scene`, and common game objects
- Reactive Pinia integration — game state flows naturally through Vue's reactivity system
- Scene lifecycle hooks aligned with Vue's `onMounted` / `onUnmounted`
- TypeScript-first with full generic scene key support

### Commands

Run from `packages/vue-phaserjs/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-phaserjs/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-phaserjs/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-phaserjs/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-phaserjs.svg
