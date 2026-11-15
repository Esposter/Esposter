# Library additions not taken

Composables and components that the vue-phaserjs library does not add, one section each. Each is refused because a Phaser call already does the job, the app owns the logic, or no call site needs it yet, and a component is added when the game that needs it does.

## `useSound()`

A composable for playing sounds.

**Why not:** Sound is managed via service functions (`getDungeonsSound`, `getDungeonsSoundEffect`) that pass `scene` explicitly; a composable would create a competing pattern without replacing any existing call site.

## `usePointer()` and `useGamepad()`

Composables exposing pointer and gamepad state as reactive refs.

**Why not:** Polling reactive refs every frame adds Vue reactivity overhead with no benefit over reading `scene.input.activePointer` or the gamepad directly in an `onUpdate` handler.

## Scene transition effects

Built-in transition variants for switching scenes.

**Why not:** App-specific; the caller should own transition logic. The library's `switchToScene()` provides the hook, and transition variants belong in the consuming app.

## `<TilemapLayer>` and `<TilemapObjectLayer>`

Components wrapping tilemap layer and object-layer creation.

**Why not:** Layer creation has strict imperative ordering (it depends on tileset add order), which a wrapper would obscure. The `@complete` callback on `<Tilemap>` already exposes the tilemap for direct `createLayer()` and `getObjectLayer()` calls.

## Multiple cameras

A Vue abstraction for managing multiple cameras.

**Why not:** Cameras aren't game objects; their setup is one-time imperative configuration already doable in a scene's `create` handler, and no meaningful Vue component hierarchy maps to camera ownership.

## `<Group>`

A Vue component wrapping `Phaser.GameObjects.Group`.

**Why not:** A Group extends `EventEmitter`, not `GameObject`, so it has no visual or render properties to bind, and `v-for` already handles the grouping use case in Vue.

## `useArcadePhysics()`

A composable wrapping Arcade physics.

**Why not:** Low viability until there is a specific use case; Arcade physics requires game-config changes and is deeply app-specific.

## `useDrag()`

A composable for drag interactions.

**Why not:** `useInitializeGameObjectEvents` already exposes game object events including drag; this would be a thin wrapper over existing functionality.

## `useSceneData()`

A composable for passing init data between scenes.

**Why not:** Scene init data is managed via Pinia stores instead of being passed between scenes.

## Camera tween helpers

Wrapper helpers for camera flash, shake, pan, zoom and rotate effects (`flashCamera`, `shakeCamera`, `panCamera`, `zoomCamera` and `rotateTo`).

**Why not:** Not used anywhere in the codebase; a wrapper is only worth adding when a real call site needs one. Until then, call the Phaser camera API directly.

## `<Tween>`

A Vue component for tweens.

**Why not:** Redundant with `useTween`, which already integrates with the SetterMap and configuration system and is used throughout the codebase.

## `useTimeline()`

A composable for chaining tweens into a timeline.

**Why not:** Direct `scene.tweens.chain()` in `@complete` is sufficient; timeline chaining is app-specific and doesn't benefit from a library abstraction.
