---
name: vue-phaserjs
description: Esposter vue-phaserjs integration patterns — the four files every game object component takes and what is deliberately absent, markRaw for Phaser objects in Pinia stores, configuration Pick pattern, all-configuration-keys-present-at-setup. Apply when writing Phaser game objects, stores, or vue-phaserjs components.
---

# vue-phaserjs Conventions

## Components

Every game object component follows the same 4-file pattern, split across four trees — which is the whole inventory rule: what exists is whatever `src/components/` holds, and adding one means adding all four files.

| File                         | Path                                              |
| ---------------------------- | ------------------------------------------------- |
| `{Name}.vue`                 | `packages/vue-phaserjs/src/components/`           |
| `{Name}Configuration.ts`     | `packages/vue-phaserjs/src/models/configuration/` |
| `{Name}EventEmitsOptions.ts` | `packages/vue-phaserjs/src/models/emit/`          |
| `{Name}SetterMap.ts`         | `packages/vue-phaserjs/src/util/setterMap/`       |

`<Game>` mounts the Phaser game and hosts `<Scene>`; every shape component extends `ShapeConfiguration`. One naming trap: the component is `<Nineslice>` with a lowercase `s` — `<NineSlice>` resolves to nothing.

**Deliberately absent, so don't add them to fill a gap**: `<Group>` (use `v-for`), `<Layer>` (incompatible with `useInitializeGameObject`), input composables (use `onUpdate` directly), and `useTimeline` / physics / camera / tilemap-layer components.

## Configuration Interfaces — `Pick` from Game Object Types

When a configuration interface re-declares properties that exist on the Phaser game object, use `Pick<GameObjects.X, "prop1" | "prop2">` in `extends` instead of re-declaring each property individually:

```ts
export interface ArcConfiguration
  extends ShapeConfiguration, Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle"> {}
```

Keep explicit declarations only for `Parameters<GameObjects.X["method"]>` tuples and plain primitives (`number`, `string`) that are constructor args without a matching readable property.

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

## SetterMap void-return

`SetterMap` types the inner setter function as returning `void`. When the setter body is a single method call that returns a value (Phaser fluent API), wrap it in braces — never use the `void` operator:

```ts
x: (gameObject) => (value) => { gameObject.setX(value); }, // wrap in braces; never the void operator
```

Multi-line setters already use braces naturally — no change needed.

## Phaser Objects in Pinia Stores

**Always use `markRaw()` when assigning a Phaser object to any reactive ref in a Pinia store** — the rule and its rationale live in the `pinia` skill ("Storing Class Instances — markRaw").

This package itself has zero `markRaw` usages — the rule bites in the consuming app (`packages/app/app/`: `store/`, `components/Dungeons/`, `composables/dungeons/`). Look there for real examples.

```ts
sprite.value = markRaw(newSprite); // traverse-safe
```

Any Phaser class that chains to `Scene → TextureManager → Texture → Frame → glTexture` is a risk:

- `GameObjects.*` (Sprite, Image, PathFollower, Container, Text, etc.)
- `Tilemaps.Tilemap`, `Tilemaps.TilemapLayer`
- `Input.Keyboard.Key`, `Input.Keyboard.CursorKeys` (via KeyboardPlugin → Scene)
- Rex plugin instances (Slider, VirtualJoystick, etc.)
- Any class that holds a `scene` reference

## SSR / "Phaser is not defined"

`phaser` and `phaser4-rex-plugins` must stay externalized, subpaths included. A bundled `phaser4-rex-plugins/plugins/*.js` reads `Phaser.Scene`/`Phaser.Game` as globals at module-eval time and throws under Node SSR.

Nothing in this package configures that: they are its `peerDependencies`, which tsdown externalizes. Keep them peers.
