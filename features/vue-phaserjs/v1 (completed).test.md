# vue-phaserjs — Testing Roadmap

All tests run against a real headless Phaser game (`type: Phaser.HEADLESS`). Testing SetterMaps or stores in isolation with mock objects provides little value — the real signal comes from mounting a component against an actual scene and asserting that Phaser state changed correctly. SetterMap behaviour is covered generically via the "SetterMap applied on init" and "Reactive setter update" tests in `useInitializeGameObject`; there is no value in repeating the same test for every setter.

`happy-dom` does not provide enough DOM API for Phaser out of the box — a `setupCanvas.ts` global setup stubs the missing canvas 2D context methods. `game.step()` is not usable in headless mode (renderer is null) — use `stepScene(scene, n)` which calls lifecycle listeners directly.

---

## Infrastructure

- [x] **Vitest config for `vue-phaserjs`** — `vitest.config.ts` with `environment: 'happy-dom'` and a global setup file.
- [x] **Headless game fixture** — `test/fixtures/headlessGame.ts`; boots `new Phaser.Game({ type: Phaser.HEADLESS, audio: { noAudio: true }, scene: [] })` in `beforeAll`, calls `game.destroy(true)` in `afterAll`. Exposes a `startTestScene(key, config)` helper that adds a minimal scene and waits for its `create` event.
- [x] **Scene advance helper** — `stepScene(scene, n)` calls lifecycle listeners directly n times so `onUpdate` / `onNextTick` handlers fire in tests.
- [x] **Vue Test Utils wrapper** — thin helper that mounts a component inside the injection context required by vue-phaserjs (`SceneKey` injection, `usePhaserStore` seeded with the headless game).

---

## Lifecycle hook tests

- [x] **`onCreate`** — handler registered before scene start fires exactly once during `create`.
- [x] **`onInit`** — handler fires during `init`, before `create`.
- [x] **`onPreload`** — handler fires during `preload`.
- [x] **`onUpdate`** — handler fires each frame; advancing the scene N times calls it N times.
- [x] **`onNextTick`** — fires once on the next step then clears; re-registering per tick is needed for repeated firing.
- [x] **`onShutdown`** — fires on `scene.sys.events` `shutdown`.
- [x] **Hook isolation** — handlers registered for scene A do not fire when scene B advances.

---

## `useInitializeGameObject` tests

- [x] **Game object created** — covered by Sprite, Container, Text component tests.
- [x] **SetterMap applied on init** — initial configuration values are applied to the actual Phaser game object after creation.
- [x] **Reactive setter update** — changing a configuration ref property calls the correct Phaser setter and the game object property reflects the new value.
- [x] **Parent container insertion** — covered by Container component test (`parentContainer` is not null on child sprite).
- [x] **Cleanup on unmount** — `gameObject.destroy()` is called when the component unmounts; the object is removed from the scene's display list.
- [x] **`immediate` flag** — with `immediate: true`, the creator function runs before `onCreate` fires (used for mid-game spawn).

---

## Component tests

- [x] **`Scene.vue`** — mounts with a `sceneKey`; scene is added to the Phaser game; `@init`, `@preload`, `@create` events are emitted in order; `@shutdown` fires when the scene is stopped externally.
- [x] **`Sprite.vue`** — game object created with the correct texture; `@complete` fires after creation; sprite is on the scene display list.
- [x] **`Container.vue`** — child Sprite mounted in slot has a non-null `parentContainer`; Container itself appears on scene display list.
- [x] **`Text.vue`** — text is created with the correct content; `defaultTextStyle` from `useTextStore` is merged with the passed style.
- [x] **`Tilemap.vue`** — `scene.make.tilemap()` called with the configured key; changing the key destroys the old tilemap and creates a new one; `@complete` fires with the new tilemap instance.
- [x] **`PathFollower.vue`** — `scene.add.follower()` called with the provided path and texture; follower is on the scene's display list after creation.
- [x] **`Arc.vue`** — radius, startAngle, endAngle reflected on the Phaser Arc after mount.

---

## Store integration tests

These test store actions against a real headless scene rather than mocks.

- [x] **`useCameraStore.fadeOut` / `fadeIn`** — `isFading` is `true` during the fade; `useInputStore.isInputActive` is `false` while fading.
- [x] **`usePhaserStore.switchToScene`** — `sceneKey` updates, the old scene stops and the new scene starts.
- [x] **`usePhaserStore.launchParallelScene` / `removeParallelScene`** — parallel scene runs alongside the root scene; removing it stops only the parallel scene.

---

## Utility unit tests

- [x] **`pushGameObject`** — depth-sorting insertion: appends when no depth, inserts at correct position by depth, prepends when depth less than all existing.

---

## Known unknowns (resolved)

- ~~Phaser headless in happy-dom has not been validated~~ — confirmed working with happy-dom + canvas stub.
- Asset loading (`onPreload` / `scene.load.*`) will fail in headless without real files; preload tests should either skip asset assertions or use `scene.textures.addBase64()` stubs.
- Phaser's `Text` game object requires a fuller canvas 2D context mock than other objects (`scale`, `rotate`, `translate`, `measureText`, etc.) — all now stubbed in `setupCanvas.ts`.
