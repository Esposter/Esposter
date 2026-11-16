---
name: vue-phaserjs
description: Apply when writing Phaser game objects, stores that hold them, or vue-phaserjs components. Esposter's vue-phaserjs integration of Phaser game objects into Vue components and stores.
---

# vue-phaserjs Conventions

## Settled — do not re-propose

- **A `<Group>` component** — a `v-for` over the children is the group.
- **A `<Layer>` component** — it is incompatible with `useInitializeGameObject`.
- **Input composables** — `onUpdate` reads input directly.
- **`useTimeline`, physics, camera or tilemap-layer components** — nothing consumes them, and a component is added for the game that needs it.

Each refused addition has its reason on [the library additions page](../../../openspec/rejected/vue-phaserjs/additions/design.md).

## Components

Every game object component follows the same 5-file pattern, split across five trees, and omits a file it does not need, such as `<Circle>`, which takes `<Arc>`'s configuration, emits and setter map — which is the whole inventory rule: what exists is whatever `src/components/` holds, and adding one means adding the files it needs.

| File                         | Path                                              |
| ---------------------------- | ------------------------------------------------- |
| `{Name}.vue`                 | `packages/vue-phaserjs/src/components/`           |
| `{Name}Configuration.ts`     | `packages/vue-phaserjs/src/models/configuration/` |
| `{Name}EventEmitsOptions.ts` | `packages/vue-phaserjs/src/models/emit/`          |
| `{Name}Setter.ts`            | `packages/vue-phaserjs/src/models/setterMap/`     |
| `{Name}SetterMap.ts`         | `packages/vue-phaserjs/src/services/setterMap/`   |

`<Game>` mounts the Phaser game and hosts `<Scene>`; every shape component extends `ShapeConfiguration`. One naming trap: the component is `<Nineslice>` with a lowercase `s` — `<NineSlice>` resolves to nothing.

## Configuration Interfaces — `Pick` from Game Object Types

A new component's configuration `Pick`s from the Phaser game object type, and a setter returning a fluent value is wrapped in braces, never `void` (`references/adding-a-component.md`).

## Configuration Keys

`useInitializeGameObjectSetters` watches every key its setter map names, whatever the configuration held at setup, so a key may be left out, handed `undefined` or given a value later, and the game object follows it. A key with no value leaves the game object as Phaser made it, and the component emits that intrinsic value so a `v-model` still reads one; a missing key and an `undefined` one are the same thing here, as everywhere (the `absent-values` skill).

## Phaser Objects in Pinia Stores

A Phaser object assigned to reactive store state is `markRaw`ed — the rule is the `pinia` skill's (`references/class-instances-in-state.md`), and which Phaser classes it bites is `references/phaser-objects-in-stores.md`.

## SSR / "Phaser is not defined"

`phaser` and `phaser4-rex-plugins` must stay externalized, subpaths included. A bundled `phaser4-rex-plugins/plugins/*.js` reads `Phaser.Scene`/`Phaser.Game` as globals at module-eval time and throws under Node SSR.

Nothing in this package configures that: they are its `peerDependencies`, which tsdown externalizes. Keep them peers.

## Reference pages

- `references/adding-a-component.md` — when adding a component, or writing its configuration interface or setter map.
- `references/phaser-objects-in-stores.md` — when an app store holds a Phaser object, and which classes need `markRaw`.
