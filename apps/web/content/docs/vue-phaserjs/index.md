---
title: vue-phaserjs
description: Phaser 4 game engine integration for Vue 3 — declarative game object components, lifecycle hook composables, and a reactive configuration system.
---

# vue-phaserjs

`packages/vue-phaserjs` (npm `vue-phaserjs`) integrates the Phaser 4 game engine with Vue 3. Instead of imperatively creating and mutating Phaser game objects, you compose a game from Vue components: mount a `<Sprite>` and a sprite appears in the scene, change a reactive property and the live game object updates, unmount the component and the object is destroyed.

## Key concepts

- **Game object components** — one Vue component per Phaser game object type, from the scene shell (`<Game>`, `<Scene>`) through the sprite/container/text set to the shapes and media; `ls packages/vue-phaserjs/src/components` is the current list. Each creates its Phaser object on mount, emits it via `@complete` for imperative follow-up work, and destroys it on unmount.
- **SetterMap / configuration** — components take a `configuration` object; a per-type SetterMap maps each configuration key to the matching Phaser setter, so mutating a reactive configuration property calls the right setter on the live game object. `useInitializeGameObject` implements this creation → setter-binding → cleanup pipeline for every component.
- **Lifecycle hook composables** — `onInit`, `onPreload`, `onCreate`, `onUpdate`, `onNextTick`, and `onShutdown` register handlers against the injected scene key, mirroring Phaser's scene lifecycle inside Vue components.
- **Pinia stores** — `usePhaserStore` (game instance, scene switching, parallel scenes), `useCameraStore` (fades), `useInputStore` (input gating), and `useTextStore` (default text style). Phaser objects held in stores are wrapped in `markRaw` so Vue never proxies engine internals.

The library is mature — there is no active roadmap. Ideas for new components or composables were evaluated and settled in [rejected](/docs/vue-phaserjs/rejected) (one page per idea); most Phaser primitives that don't map to a Vue component hierarchy are intentionally left as imperative calls on the object received from `@complete`. The remaining unwrapped game-object types are [deferred](/docs/vue-phaserjs/deferred) until a scene needs one.

Every component is exercised against a real headless Phaser game rather than a mock — [testing](/docs/vue-phaserjs/testing) covers how, and what that buys.
