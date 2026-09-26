---
name: vue-phaserjs
description: Apply when writing Phaser game objects, stores that hold them, or vue-phaserjs components. Esposter's vue-phaserjs integration — the component files, configurations that update, and Phaser objects under Vue reactivity.
---

# vue-phaserjs Conventions

## Components

Every game object component follows the same 4-file pattern, split across four trees — which is the whole inventory rule: what exists is whatever `src/components/` holds, and adding one means adding all four files.

| File                         | Path                                              |
| ---------------------------- | ------------------------------------------------- |
| `{Name}.vue`                 | `packages/vue-phaserjs/src/components/`           |
| `{Name}Configuration.ts`     | `packages/vue-phaserjs/src/models/configuration/` |
| `{Name}EventEmitsOptions.ts` | `packages/vue-phaserjs/src/models/emit/`          |
| `{Name}SetterMap.ts`         | `packages/vue-phaserjs/src/services/setterMap/`   |

`<Game>` mounts the Phaser game and hosts `<Scene>`; every shape component extends `ShapeConfiguration`. One naming trap: the component is `<Nineslice>` with a lowercase `s` — `<NineSlice>` resolves to nothing.

**Deliberately absent, so don't add them to fill a gap**: `<Group>` (use `v-for`), `<Layer>` (incompatible with `useInitializeGameObject`), input composables (use `onUpdate` directly), and `useTimeline` / physics / camera / tilemap-layer components.

## Configuration Interfaces — `Pick` from Game Object Types

A new component's configuration `Pick`s from the Phaser game object type, and a setter returning a fluent value is wrapped in braces, never `void` (`references/adding-a-component.md`).

## Configuration Keys Must All Be Present at Setup

A `configuration` object must carry **every key it will ever want to update**, even when the value is `undefined`. `useInitializeGameObjectSetters` enumerates `Object.entries(toValue(configuration))` once during setup and registers a setter plus a watcher only for the keys present at that moment. A key absent then gets neither, for the lifetime of the game object — later values are silently dropped with no error.

`key: undefined` is fine and explicitly handled: the setter still runs, and the composable emits the intrinsic game object value instead of the missing one.

So build configurations as complete inline object literals, and never spread an optional-prop object straight into one:

```vue
<!-- correct — displayWidth is always a key, undefined or not -->
<Image :configuration="{ visible: isVisible, ...imagePosition, texture, displayWidth, scaleY, tween }" />

<!-- wrong — an omitted optional prop leaves the key absent, so it never gets a watcher -->
<Image :configuration="props" />
```

A `displayWidth?: number` props declaration is still correct; the component just has to name the key when it builds the configuration.

## Phaser Objects in Pinia Stores

A Phaser object assigned to reactive store state is `markRaw`ed — the rule is the `pinia` skill's (`references/class-instances-in-state.md`), and which Phaser classes it bites is `references/phaser-objects-in-stores.md`.

## SSR / "Phaser is not defined"

`phaser` and `phaser4-rex-plugins` must stay externalized, subpaths included. A bundled `phaser4-rex-plugins/plugins/*.js` reads `Phaser.Scene`/`Phaser.Game` as globals at module-eval time and throws under Node SSR.

Nothing in this package configures that: they are its `peerDependencies`, which tsdown externalizes. Keep them peers.

## Reference pages

- `references/adding-a-component.md` — when adding a component, or writing its configuration interface or setter map.
- `references/phaser-objects-in-stores.md` — when an app store holds a Phaser object, and which classes need `markRaw`.
