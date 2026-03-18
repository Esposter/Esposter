# vue-phaserjs — Feature Roadmap

## Missing Components (config + SetterMap already exist)

- [ ] **`<Arc>`** — `ArcConfiguration` and `ArcSetterMap` are fully implemented; only `Arc.vue` is missing. Mirrors the `Circle.vue` pattern with `scene.add.arc()`.

## New Game Object Components

- [ ] **`<Group>`** — `Phaser.GameObjects.Group` (non-Container group; does not transform children but enables bulk operations like setVisible, setAlpha, setDepth across members).
- [ ] **`<Graphics>`** — `Phaser.GameObjects.Graphics` for programmatic drawing (lines, filled shapes, gradients). Requires a callback/slot pattern since the draw commands are imperative.
- [ ] **`<BitmapText>`** — `Phaser.GameObjects.BitmapText`; higher performance than `Text` for frequently updated labels (score, timers). Requires a bitmap font asset loaded in preload.
- [ ] **`<RenderTexture>`** — `Phaser.GameObjects.RenderTexture`; lets you snapshot and stamp other game objects onto a texture — useful for trails, footprints, or cached backgrounds.
- [ ] **`<Particles>`** — `Phaser.GameObjects.Particles.ParticleEmitter` (Phaser 3.60+ unified API). High effort due to complex emitter config, but valuable for hit effects, weather, fire/smoke.
- [ ] **`<Video>`** — `Phaser.GameObjects.Video`; plays HTML5 video inside the game canvas.
- [ ] **`<Polygon>`** — `Phaser.GameObjects.Polygon` for custom filled polygon shapes.
- [ ] **`<Star>`** — `Phaser.GameObjects.Star` for n-point star shapes with inner/outer radius control.

## Camera

- [ ] **`flashCamera()`** — `camera.flash(duration, r, g, b)` effect in `useCameraStore`; white/colour flash on hit or transition.
- [ ] **`shakeCamera()`** — `camera.shake(duration, intensity)` in `useCameraStore`; screen shake for impacts or explosions.
- [ ] **`panCamera()`** — `camera.pan(x, y, duration, ease)` in `useCameraStore`; smooth pan to a world coordinate.
- [ ] **`zoomCamera()`** — `camera.zoomTo(zoom, duration, ease)` in `useCameraStore`; animated zoom in/out.
- [ ] **`rotateTo()`** — `camera.rotateTo(radians, shortestPath, duration, ease)` in `useCameraStore`.
- [ ] **Multiple cameras** — `scene.cameras.add()` for split-screen or minimap; a `<Camera>` component providing a camera context to children for bounds/follow configuration.

## Tilemap

- [ ] **`<TilemapLayer>`** — Wraps `tilemap.createLayer()` as a declarative child of `<Tilemap>`; takes `layerName` and `tileset` props. Currently all layer creation is manual and imperative in `useCreateTilemapAssets`.
- [ ] **`<TilemapObjectLayer>`** — Reads an object layer from the Tiled JSON and emits objects as typed data (position, custom properties) via a `@objects` event, removing the need for manual `getObjects()` calls in composables.

## Sound

- [ ] **`useSound()`** — Composable wrapping `scene.sound`; exposes `play(key, config?)`, `stop(key)`, `fadeIn(key, duration)`, `fadeOut(key, duration)`, and `setVolume(value)`. Cleans up on `onShutdown`. Currently callers call `scene.sound.*` directly in multiple places.

## Input

- [ ] **`usePointer()`** — Reactive composable exposing `scene.input.activePointer` position and button state; updates on `onUpdate` so components can track cursor world position without manual event listeners.
- [ ] **`useGamepad()`** — Wraps `scene.input.gamepad`; exposes button/axis refs updated each frame via `onUpdate`.
- [ ] **`useDrag()`** — Composable that calls `scene.input.setDraggable()` and exposes `onDragStart`, `onDrag`, `onDragEnd` callbacks without needing to touch `useInitializeGameObjectEvents` directly.

## Tweens & Timelines

- [ ] **`useTimeline()`** — Composable wrapping `scene.tweens.chain()` (Phaser 3.60+) or `scene.tweens.timeline()` for sequencing multiple tweens; currently chaining is done via nested `onComplete` callbacks.
- [ ] **`<Tween>`** — Declarative component that creates a tween on mount and destroys it on unmount; binds `configuration` as a `TweenBuilderConfiguration` prop (model already exists).

## Scene Management

- [ ] **`useSceneData()`** — Typed composable for accessing `scene.sys.settings.data` (init data passed between scenes via `scene.start(key, data)`); removes the need for stores to carry cross-scene init state.
- [ ] **Scene transition effects** — Extend `switchToScene()` in `usePhaserStore` with transition types beyond the current fade (slide, wipe, cross-fade between two scenes simultaneously).

## Physics

- [ ] **`useArcadePhysics()`** — Composable enabling `scene.physics.add.sprite()` / `.image()` and exposing `body` refs with velocity, acceleration, gravity overrides, and `onCollide`/`onOverlap` hooks. Requires Arcade physics enabled in the game config — low viability until there is a specific use case.

## Testing

Testing Phaser in a Node/Vitest environment is possible at different levels of cost and confidence:

- [ ] **SetterMap unit tests** — SetterMaps are pure functions `(gameObject, emit) => (value) => void`. The game object can be a plain mock object (`{ setX: vi.fn(), ... }`). No Phaser or canvas needed; straightforward Vitest.
- [ ] **`pushGameObject` unit test** — Pure depth-sorting insertion logic; testable with mock container and game object objects.
- [ ] **Pinia store unit tests** (`usePhaserStore`, `useCameraStore`, `useInputStore`) — Use `createTestingPinia()` from `@pinia/testing`; mock Phaser scene/camera methods on the store's game ref.
- [ ] **Phaser headless component tests** — Phaser ships a `HEADLESS` renderer (`type: Phaser.HEADLESS`) that skips canvas and WebGL entirely. A `beforeAll` fixture can boot a headless `Phaser.Game`, register a test scene, and mount vue-phaserjs components via Vue Test Utils against it. `happy-dom` supports enough of the DOM API for headless Phaser to initialise. High setup cost; best reserved for testing `Scene.vue` lifecycle, `useInitializeGameObject`, and hook ordering.
