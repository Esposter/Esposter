---
title: Rejected
description: Settled won't-dos — most Phaser primitives that don't map to a Vue hierarchy stay imperative.
---

# Rejected

Grep here before proposing a new vue-phaserjs component or composable. The recurring theme: if a Phaser primitive has no visual component hierarchy or is app-specific, it stays an imperative call on the object received from `@complete` rather than becoming a library abstraction.

- [Group component](/docs/vue-phaserjs/rejected/group-component) — Group isn't a GameObject; `v-for` covers grouping
- [Camera tween helpers](/docs/vue-phaserjs/rejected/camera-tween-methods) — no call site needs them
- [Multiple cameras](/docs/vue-phaserjs/rejected/multiple-cameras) — one-time imperative setup via `@complete`
- [Tilemap layer components](/docs/vue-phaserjs/rejected/tilemap-layer-components) — layer creation order is imperative
- [Tween component](/docs/vue-phaserjs/rejected/tween-component) — redundant with `useTween`
- [useTimeline](/docs/vue-phaserjs/rejected/use-timeline) — `scene.tweens.chain()` suffices
- [useSound](/docs/vue-phaserjs/rejected/use-sound) — service functions own sound
- [Input polling composables](/docs/vue-phaserjs/rejected/input-polling-composables) — per-frame reactivity overhead
- [useDrag](/docs/vue-phaserjs/rejected/use-drag) — events already exposed
- [useSceneData](/docs/vue-phaserjs/rejected/use-scene-data) — Pinia stores own scene data
- [useArcadePhysics](/docs/vue-phaserjs/rejected/use-arcade-physics) — no use case yet
- [Scene transition effects](/docs/vue-phaserjs/rejected/scene-transition-effects) — app-specific
