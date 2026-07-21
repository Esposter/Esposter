---
name: vue-phaserjs
description: Esposter vue-phaserjs integration patterns — component inventory, markRaw for Phaser objects in Pinia stores, configuration Pick pattern, all-configuration-keys-present-at-setup. Apply when writing Phaser game objects, stores, or vue-phaserjs components.
---

# vue-phaserjs Conventions

## Implemented Components (v1 complete)

All game object components follow the same 4-file pattern, split across four trees:

| File                         | Path                                              |
| ---------------------------- | ------------------------------------------------- |
| `{Name}.vue`                 | `packages/vue-phaserjs/src/components/`           |
| `{Name}Configuration.ts`     | `packages/vue-phaserjs/src/models/configuration/` |
| `{Name}EventEmitsOptions.ts` | `packages/vue-phaserjs/src/models/emit/`          |
| `{Name}SetterMap.ts`         | `packages/vue-phaserjs/src/util/setterMap/`       |

**Root**: `<Game>` (mounts the Phaser game; hosts `<Scene>`)

**Sprites / Images**: `<Sprite>`, `<Image>`, `<Nineslice>` (lowercase `s` — `NineSlice` resolves to nothing), `<TileSprite>`, `<PathFollower>`

**Text**: `<Text>`, `<BitmapText>`

**Shapes** (all extend `ShapeConfiguration`): `<Arc>`, `<Circle>`, `<Rectangle>`, `<Ellipse>`, `<Line>`, `<Triangle>`, `<Polygon>`, `<Star>`, `<Curve>`, `<IsoBox>`, `<IsoTriangle>`

**Effects / Rendering**: `<Graphics>`, `<RenderTexture>`, `<Particles>`, `<Video>`

**Structure**: `<Container>`, `<Zone>`, `<Tilemap>`, `<Scene>`

**Not implemented**: `<Group>` (use `v-for`), `<Layer>` (incompatible with `useInitializeGameObject`), input composables (use `onUpdate` directly), `useTimeline`/physics/camera/tilemap-layer components.

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

## SSR / "Phaser is not defined" Fix

**Rule**: In the shared `external` list, always use `/^package-name/u` (regex) instead of `"package-name"` (string) when the package may be imported via subpaths. String literals only match exact module IDs.

Cause: `external` used `"phaser4-rex-plugins"`, which matched only the root package, not subpath imports like `"phaser4-rex-plugins/plugins/clickoutside.js"`. The bundled subpath code accesses `Phaser.Scene`/`Phaser.Game` as globals at module-eval time, failing in Node.js SSR.

The externals no longer live in this package — `packages/vue-phaserjs/vite.config.ts` just re-exports `getViteConfiguration()`. The entries are in the shared list at `packages/configuration/src/external/external.ts`, grouped by owning package:

```ts
// @esposter/vue-phaserjs
"phaser",
/^phaser4-rex-plugins/u,
```
