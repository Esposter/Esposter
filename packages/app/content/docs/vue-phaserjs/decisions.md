---
title: Decisions
description: Rejected component and composable ideas for vue-phaserjs — most Phaser primitives that don't map to a Vue hierarchy stay imperative.
---

# Decisions

Grep this page before proposing a new vue-phaserjs component or composable. The recurring theme: if a Phaser primitive has no visual component hierarchy or is app-specific, it stays an imperative call on the object received from `@complete` rather than becoming a library abstraction.

## `<Group>`

**Rejected** — a Vue component wrapping `Phaser.GameObjects.Group`. A Group extends `EventEmitter`, not `GameObject`, so it has no visual/render properties to bind, and `v-for` already handles the grouping use case in Vue.

## Camera tween helpers (`flashCamera` / `shakeCamera` / `panCamera` / `zoomCamera` / `rotateTo`)

**Rejected** — wrapper helpers for camera flash/shake/pan/zoom/rotate effects. Not used anywhere in the codebase; a wrapper is only worth adding when a real call site needs one. Until then, call the Phaser camera API directly.

## Multiple cameras

**Rejected** — a Vue abstraction for managing multiple cameras. Cameras aren't game objects; their setup is one-time imperative configuration already doable via `@complete` on `<Scene>`, and no meaningful Vue component hierarchy maps to camera ownership.

## `<TilemapLayer>` / `<TilemapObjectLayer>`

**Rejected** — components wrapping tilemap layer and object-layer creation. Layer creation has strict imperative ordering (it depends on tileset add order), which a wrapper would obscure. The `@complete` callback on `<Tilemap>` already exposes the tilemap for direct `createLayer()` / `getObjectLayer()` calls.

## `<Tween>`

**Rejected** — a Vue component for tweens. Redundant with `useTween`, which already integrates with the SetterMap/configuration system and is used throughout the codebase.

## `useTimeline()`

**Rejected** — a composable for chaining tweens into a timeline. Direct `scene.tweens.chain()` in `@complete` is sufficient; timeline chaining is app-specific and doesn't benefit from a library abstraction.

## `useSound()`

**Rejected** — a composable for playing sounds. Sound is managed via service functions (`getDungeonsSound`, `getDungeonsSoundEffect`) that pass `scene` explicitly; a composable would create a competing pattern without replacing any existing call site.

## `usePointer()` / `useGamepad()` (input polling)

**Rejected** — composables exposing pointer/gamepad state as reactive refs. Polling reactive refs every frame adds Vue reactivity overhead with no benefit over reading `scene.input.activePointer` or the gamepad directly in an `onUpdate` handler.

## `useDrag()`

**Rejected** — a composable for drag interactions. `useInitializeGameObjectEvents` already exposes game object events including drag; this would be a thin wrapper over existing functionality.

## `useSceneData()`

**Rejected** — a composable for passing init data between scenes. Scene init data is managed via Pinia stores instead of being passed between scenes.

## `useArcadePhysics()`

**Rejected** — a composable wrapping Arcade physics. Low viability until there is a specific use case; Arcade physics requires game-config changes and is deeply app-specific.

## Scene transition effects

**Rejected** — built-in transition variants for switching scenes. App-specific; the caller should own transition logic. The library's `switchToScene()` provides the hook, and transition variants belong in the consuming app.
