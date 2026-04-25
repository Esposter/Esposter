# vue-phaserjs — Feature Roadmap

## Missing Components (config + SetterMap already exist)

- [x] **`<Arc>`** — `ArcConfiguration` and `ArcSetterMap` are fully implemented; only `Arc.vue` is missing. Mirrors the `Circle.vue` pattern with `scene.add.arc()`.

## New Game Object Components

- ~~**`<Group>`**~~ — `Phaser.GameObjects.Group` extends `EventEmitter`, not `GameObject` — no visual/render properties; `v-for` handles the grouping use case in Vue.
- [x] **`<Graphics>`** — `Phaser.GameObjects.Graphics` for programmatic drawing (lines, filled shapes, gradients). Drawing done via `onComplete` callback since draw commands are imperative.
- [x] **`<BitmapText>`** — `Phaser.GameObjects.BitmapText`; higher performance than `Text` for frequently updated labels (score, timers). Requires a bitmap font asset loaded in preload.
- [x] **`<RenderTexture>`** — `Phaser.GameObjects.RenderTexture`; lets you snapshot and stamp other game objects onto a texture — useful for trails, footprints, or cached backgrounds.
- [x] **`<Particles>`** — `Phaser.GameObjects.Particles.ParticleEmitter` (Phaser 3.60+ unified API). High effort due to complex emitter config, but valuable for hit effects, weather, fire/smoke.
- [x] **`<Video>`** — `Phaser.GameObjects.Video`; plays HTML5 video inside the game canvas.
- [x] **`<Polygon>`** — `Phaser.GameObjects.Polygon` for custom filled polygon shapes.
- [x] **`<Star>`** — `Phaser.GameObjects.Star` for n-point star shapes with inner/outer radius control.
- [x] **`<Ellipse>`** — `Phaser.GameObjects.Ellipse` for ellipse/circle shapes with configurable smoothness.
- [x] **`<Line>`** — `Phaser.GameObjects.Line` for line segments with configurable width and endpoints.
- [x] **`<Triangle>`** — `Phaser.GameObjects.Triangle` for filled triangles with three configurable vertices.
- [x] **`<Curve>`** — `Phaser.GameObjects.Curve` for rendering a `Phaser.Curves.Curve` path as a filled shape.
- [x] **`<IsoBox>`** — `Phaser.GameObjects.IsoBox` for isometric box shapes with per-face fill colors and projection control.
- [x] **`<IsoTriangle>`** — `Phaser.GameObjects.IsoTriangle` for isometric pyramid shapes with per-face fill colors, reversible orientation, and projection control.

## Camera

- ~~**`flashCamera()`**~~ — Not currently used in the codebase.
- ~~**`shakeCamera()`**~~ — Not currently used in the codebase.
- ~~**`panCamera()`**~~ — Not currently used in the codebase.
- ~~**`zoomCamera()`**~~ — Not currently used in the codebase.
- ~~**`rotateTo()`**~~ — Not currently used in the codebase.
- ~~**Multiple cameras**~~ — Cameras aren't game objects; setup is one-time imperative config already doable via `onComplete` on `<Scene>`. No meaningful Vue component hierarchy maps to camera ownership.

## Tilemap

- ~~**`<TilemapLayer>`**~~ — Layer creation has strict imperative ordering (depends on tileset add order). The `onComplete` callback on `<Tilemap>` already exposes the tilemap for direct `createLayer()` calls; a Vue wrapper would obscure the ordering constraints without adding value.
- ~~**`<TilemapObjectLayer>`**~~ — Object layer data is best read directly via `tilemap.getObjectLayer()` in `onComplete`; no Vue-specific benefit from wrapping it as a component.

## Sound

- ~~**`useSound()`**~~ — Sound is managed via service functions (`getDungeonsSound`, `getDungeonsSoundEffect`) that pass `scene` explicitly; a composable-based approach would create a competing pattern without replacing any existing call sites.

## Input

- ~~**`usePointer()`**~~ — Polling reactive refs every frame adds Vue reactivity overhead with no benefit over reading `scene.input.activePointer` directly in an `onUpdate` handler.
- ~~**`useGamepad()`**~~ — Same concern as `usePointer()`; per-frame gamepad polling doesn't benefit from Vue reactivity.
- ~~**`useDrag()`**~~ — `useInitializeGameObjectEvents` already exposes game object events including drag; a separate composable would be a thin wrapper around existing functionality.

## Tweens & Timelines

- ~~**`useTimeline()`**~~ — Direct `scene.tweens.chain()` in `onComplete` or a composable is sufficient; timeline chaining is app-specific and doesn't benefit from a library abstraction.
- ~~**`<Tween>`**~~ — Redundant with `useTween`; the existing composable integrates with the SetterMap/configuration system and is already used throughout the codebase.

## Scene Management

- ~~**`useSceneData()`**~~ — Not needed; scene init data is managed via Pinia stores instead of being passed between scenes.
- ~~**Scene transition effects**~~ — App-specific; the caller should own transition logic. The library's `switchToScene()` provides the hook; transition variants belong in the consuming app.

## Physics

- ~~**`useArcadePhysics()`**~~ — Low viability until there is a specific use case; Arcade physics requires game config changes and is deeply app-specific.
