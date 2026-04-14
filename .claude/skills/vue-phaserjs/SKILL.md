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
// ✅ Correct
export interface ArcConfiguration
  extends ShapeConfiguration, Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle"> {}

// ❌ Wrong — redundant re-declaration
export interface ArcConfiguration extends ShapeConfiguration {
  closePath: GameObjects.Arc["closePath"];
  endAngle: GameObjects.Arc["endAngle"];
  // ...
}
```

Keep explicit declarations only for `Parameters<GameObjects.X["method"]>` tuples and plain primitives (`number`, `string`) that are constructor args without a matching readable property.

## SetterMap void-return

`SetterMap` types the inner setter function as returning `void`. When the setter body is a single method call that returns a value (Phaser fluent API), wrap it in braces — never use the `void` operator:

```ts
// ✅ Correct
x: (gameObject) => (value) => { gameObject.setX(value); },

// ❌ Wrong — void operator banned
x: (gameObject) => (value) => void gameObject.setX(value),
```

Multi-line setters already use braces naturally — no change needed.

## Phaser Objects in Pinia Stores

**Always use `markRaw()` when assigning a Phaser object to any reactive ref in a Pinia store.**

Pinia devtools traverse store state via Vue's `traverse`. Phaser 3.85+ `Frame.get glTexture()` returns `null` before WebGL upload — crash in dev when traversed. `markRaw(obj)` sets `__v_skip = true` to skip traversal.

```ts
// ✅ Correct — traverse-safe
controls.value = markRaw(new KeyboardControls(scene));
controls.value = markRaw(new JoystickControls());
sprite.value = markRaw(newSprite);
pathFollower.value = markRaw(newPathFollower);
tilemap.value = markRaw(newTilemap);
volumeSlider.value = markRaw(useSlider(scene, rectangle, { ... }));

// ❌ Wrong — will crash in dev mode via traverse → Frame.get glTexture → null
controls.value = new KeyboardControls(scene);
sprite.value = newSprite;
```

Any Phaser class that chains to `Scene → TextureManager → Texture → Frame → glTexture` is a risk:

- `GameObjects.*` (Sprite, Image, PathFollower, Container, Text, etc.)
- `Tilemaps.Tilemap`, `Tilemaps.TilemapLayer`
- `Input.Keyboard.Key`, `Input.Keyboard.CursorKeys` (via KeyboardPlugin → Scene)
- Rex plugin instances (Slider, VirtualJoystick, etc.)
- Any class that holds a `scene` reference
