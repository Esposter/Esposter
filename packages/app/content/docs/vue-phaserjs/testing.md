---
title: Testing
description: How vue-phaserjs is tested — a real headless Phaser game under happy-dom, with helpers that drive scene lifecycle deterministically.
---

# Testing

All vue-phaserjs tests run against a real headless Phaser game (`type: Phaser.HEADLESS`) rather than mocks. Testing SetterMaps or stores in isolation with mock objects provides little signal — the real signal comes from mounting a component against an actual scene and asserting that Phaser state changed correctly. SetterMap behaviour is covered once, generically, in the `useInitializeGameObject` tests ("SetterMap applied on init", "Reactive setter update"); it is not repeated per setter.

## How it works

happy-dom does not provide enough DOM API for Phaser out of the box, so a global setup file stubs the missing canvas 2D context methods. Phaser's `Text` game object needs a fuller stub than the rest (`scale`, `rotate`, `translate`, `measureText`, and friends) — all are covered in `setupCanvas.ts`. `game.step()` is unusable in headless mode because the renderer is null, so a `stepScene(scene, n)` helper calls the registered lifecycle listeners directly, letting `onUpdate` / `onNextTick` handlers fire a deterministic number of times.

```mermaid
flowchart LR
  vitest["Vitest<br/>(happy-dom environment)"] -->|global setup| canvas["setupCanvas.ts<br/>canvas 2D context stubs"]
  canvas --> game["headlessGame fixture<br/>boots Phaser.HEADLESS in beforeAll"]
  game -->|"startTestScene(key)"| scene["Test scene<br/>(lifecycle listeners wired before boot)"]
  scene -->|mount with SceneKey injection + seeded usePhaserStore| component["Component under test"]
  component -->|"stepScene(scene, n)"| assert["Assert real Phaser state<br/>(display list, setters, events)"]
```

The fixture boots one game per suite (`beforeAll`) and destroys it in `afterAll`. `startTestScene(key)` adds a scene without auto-start so ready/shutdown listeners are in place before the scene boots, then hands back the live scene for mounting components inside the injection context the library expects.

## What is covered

- **Lifecycle hooks** — each of `onInit`, `onPreload`, `onCreate`, `onUpdate`, `onNextTick`, `onShutdown` fires at the right phase and the right number of times; handlers registered for one scene do not fire when another scene advances.
- **`useInitializeGameObject`** — object creation, initial SetterMap application, reactive setter updates, parent container insertion, destroy-on-unmount, and the `immediate` flag (creator runs before `onCreate`, used for mid-game spawns).
- **Components** — `Scene` (event order `@init` → `@preload` → `@create`, external `@shutdown`), `Container` (slot child gets a `parentContainer`), `Text` (merges `useTextStore` default style), `Tilemap` (key change destroys and recreates). `Sprite` has no suite of its own — it is the vehicle the `Container` and `useInitializeGameObject` tests mount, so it is covered indirectly.
- **Store integration** — `useCameraStore` fades gate `useInputStore.isInputActive`; `usePhaserStore` scene switching and parallel scene launch/removal — all against the real headless scene.
- **Utilities** — `pushGameObject` depth-sorted insertion.

## Key files

| File                                                                    | Role                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/vue-phaserjs/vitest.config.ts`                                | happy-dom environment + global setup wiring                           |
| `packages/vue-phaserjs/src/test/setupCanvas.ts`                         | Stubs the canvas 2D context methods Phaser needs under happy-dom      |
| `packages/vue-phaserjs/src/test/fixtures/headlessGame.test.ts`          | Boots/destroys the headless game; `startTestScene` helper             |
| `packages/vue-phaserjs/src/composables/useInitializeGameObject.test.ts` | Generic SetterMap + lifecycle coverage for all game object components |

## Notes

- Asset loading (`onPreload` / `scene.load.*`) fails in headless mode without real files — preload tests either skip asset assertions or stub textures via `scene.textures.addBase64()`.
