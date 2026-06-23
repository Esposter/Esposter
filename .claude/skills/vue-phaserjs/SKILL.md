---
name: vue-phaserjs
description: Esposter vue-phaserjs integration patterns — component inventory, markRaw for Phaser objects in Pinia stores, configuration Pick pattern. Apply when writing Phaser game objects, stores, or vue-phaserjs components.
---

# vue-phaserjs Conventions

## Implemented Components (v1 complete)

All game object components follow the same 4-file pattern: `{Name}Configuration.ts`, `{Name}EventEmitsOptions.ts`, `{Name}SetterMap.ts`, `{Name}.vue`.

**Sprites / Images**: `<Sprite>`, `<Image>`, `<NineSlice>`, `<TileSprite>`, `<PathFollower>`

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

## SetterMap void-return

`SetterMap` types the inner setter function as returning `void`. When the setter body is a single method call that returns a value (Phaser fluent API), wrap it in braces — never use the `void` operator:

```ts
x: (gameObject) => (value) => { gameObject.setX(value); }, // wrap in braces; never the void operator
```

Multi-line setters already use braces naturally — no change needed.

## Phaser Objects in Pinia Stores

**Always use `markRaw()` when assigning a Phaser object to any reactive ref in a Pinia store.**

Pinia devtools traverse store state via Vue's `traverse`. Phaser 3.85+ `Frame.get glTexture()` returns `null` before WebGL upload — crash in dev when traversed. `markRaw(obj)` sets `__v_skip = true` to skip traversal.

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

**Rule**: In Rolldown `external`, always use `/^package-name/` (regex) instead of `"package-name"` (string) when the package may be imported via subpaths. String literals only match exact module IDs.

Cause: `external` used `"phaser4-rex-plugins"`, which matched only the root package, not subpath imports like `"phaser4-rex-plugins/plugins/clickoutside.js"`. The bundled subpath code accesses `Phaser.Scene`/`Phaser.Game` as globals at module-eval time, failing in Node.js SSR.

Fix (`packages/vue-phaserjs/vite.config.js`):

```js
rolldownOptions: {
  external: ["phaser", /^phaser4-rex-plugins/, "pinia", "vue"],
},
```
