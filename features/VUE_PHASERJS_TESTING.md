# vue-phaserjs — Testing Roadmap

All tests run against a real headless Phaser game. Testing SetterMaps or stores in isolation with mock objects provides little value — the real signal comes from mounting a component against an actual scene and asserting that Phaser state changed correctly.

Phaser ships a `HEADLESS` renderer (`type: Phaser.HEADLESS`) that bypasses WebGL and canvas entirely. `happy-dom` provides enough DOM API for Phaser to initialise.

---

## Infrastructure (do first)

- [ ] **Vitest config for `vue-phaserjs`** — add `vitest.config.ts` to `packages/vue-phaserjs` with `environment: 'happy-dom'` and a global setup file.
- [ ] **Headless game fixture** — `test/fixtures/headlessGame.ts`; boots `new Phaser.Game({ type: Phaser.HEADLESS, audio: { noAudio: true }, scene: [] })` in `beforeAll`, calls `game.destroy(true)` in `afterAll`. Exposes a `startTestScene(key, config)` helper that adds a minimal scene and waits for its `create` event.
- [ ] **Scene advance helper** — `stepScene(game, n)` calls `game.step(performance.now(), 16)` n times so `onUpdate` / `onNextTick` handlers fire in tests.
- [ ] **Vue Test Utils wrapper** — thin helper that mounts a component inside the injection context required by vue-phaserjs (`SceneKey` injection, `usePhaserStore` seeded with the headless game).

---

## Lifecycle hook tests

- [ ] **`onCreate`** — handler registered before scene start fires exactly once during `create`.
- [ ] **`onInit`** — handler fires during `init`, before `create`.
- [ ] **`onPreload`** — handler fires during `preload`.
- [ ] **`onUpdate`** — handler fires each frame; advancing the scene N times calls it N times.
- [ ] **`onNextTick`** — fires at most once per frame even if registered multiple times in the same tick.
- [ ] **`onShutdown`** — fires on `scene.sys.events` `shutdown`; does not fire again after re-start.
- [ ] **Hook isolation** — handlers registered for scene A do not fire when scene B advances.

---

## `useInitializeGameObject` tests

- [ ] **Game object created** — creator function is called once during the correct lifecycle hook; returned game object is stored in the ref.
- [ ] **SetterMap applied on init** — initial configuration values are applied to the actual Phaser game object after creation.
- [ ] **Reactive setter update** — changing a configuration ref property calls the correct Phaser setter and the game object property reflects the new value.
- [ ] **Parent container insertion** — when `ParentContainer` is injected, the game object appears in `container.list` at the correct depth-sorted position.
- [ ] **Cleanup on unmount** — `gameObject.destroy()` is called when the component unmounts; the object is removed from the scene's display list.
- [ ] **`immediate` flag** — with `immediate: true`, the creator function runs before `onCreate` fires (used for mid-game spawn).

---

## Component tests

- [ ] **`Scene.vue`** — mounts with a `sceneKey`; scene is added to the Phaser game; `@create`, `@preload`, `@init` events are emitted in order; `@shutdown` fires on unmount.
- [ ] **`Sprite.vue`** — game object created with the correct texture; `@complete` fires after creation; changing `configuration.x` updates `sprite.x` on the actual Phaser object.
- [ ] **`Container.vue`** — child Sprite and Rectangle mounted in the slot appear in the Phaser container's `list`; depth ordering is correct.
- [ ] **`Text.vue`** — `defaultTextStyle` from `useTextStore` is merged with the passed style on the actual Phaser Text object.
- [ ] **`Tilemap.vue`** — `scene.make.tilemap()` called with the configured key; changing the key destroys the old tilemap and creates a new one; `@complete` fires with the new tilemap instance.
- [ ] **`PathFollower.vue`** — `scene.add.follower()` called with the provided path and texture; follower is on the scene's display list after creation.
- [ ] **`Arc.vue`** *(once implemented)* — radius, startAngle, endAngle reflected on the Phaser Arc after mount and after config update.

---

## Store integration tests

These test store actions against a real headless scene rather than mocks.

- [ ] **`useCameraStore.fadeOut` / `fadeIn`** — `isFading` is `true` during the fade; `useInputStore.isInputActive` is `false` while fading; both return to their initial states after the camera event fires.
- [ ] **`usePhaserStore.switchToScene`** — `sceneKey` updates, parallel scenes are cleared, the old scene stops and the new scene starts.
- [ ] **`usePhaserStore.launchParallelScene` / `removeParallelScene`** — parallel scene runs alongside the root scene; removing it stops only the parallel scene.

---

## Known unknowns

- Phaser headless in happy-dom has not been validated in this project yet. The `requestAnimationFrame` stub in happy-dom may require `vi.useFakeTimers()` to advance frames reliably.
- Phaser 4 (rc.6 currently in use) may have changed the headless boot path relative to Phaser 3 docs — needs a smoke test before investing in fixtures.
- Asset loading (`onPreload` / `scene.load.*`) will fail in headless without real files; preload tests should either skip asset assertions or use `scene.textures.addBase64()` stubs.
