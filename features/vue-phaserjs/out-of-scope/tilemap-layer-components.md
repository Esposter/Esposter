# `<TilemapLayer>` / `<TilemapObjectLayer>`

Vue components wrapping tilemap layer and object-layer creation.

## Why not

- Layer creation has strict imperative ordering (depends on tileset add order); a wrapper would obscure the constraint.
- The `onComplete` callback on `<Tilemap>` already exposes the tilemap for direct `createLayer()` / `getObjectLayer()` calls — no Vue-specific benefit.
