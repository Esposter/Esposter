# Phaser Objects in Pinia Stores

Read when a store in the consuming app holds a Phaser object — a sprite, a tilemap, a key, a Rex plugin instance.

**Always use `markRaw()` when assigning a Phaser object to any reactive ref in a Pinia store** — the rule and its rationale live in the `pinia` skill (`references/class-instances-in-state.md`).

The package holds no Phaser object in reactive state itself, so the rule bites in the consuming app (`apps/web/app/`: `store/`, `components/Dungeons/`, `composables/dungeons/`). Look there for real examples.

```ts
sprite.value = markRaw(newSprite); // traverse-safe
```

Any Phaser class that chains to `Scene → TextureManager → Texture → Frame → glTexture` is a risk:

- `GameObjects.*` (Sprite, Image, PathFollower, Container, Text, etc.)
- `Tilemaps.Tilemap`, `Tilemaps.TilemapLayer`
- `Input.Keyboard.Key`, `Input.Keyboard.CursorKeys` (via KeyboardPlugin → Scene)
- Rex plugin instances (Slider, VirtualJoystick, etc.)
- Any class that holds a `scene` reference
