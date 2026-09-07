---
title: Tilemap layer components
description: Rejected — components wrapping tilemap layer and object-layer creation.
---

# `<TilemapLayer>` / `<TilemapObjectLayer>`

Components wrapping tilemap layer and object-layer creation.

**Why not:** layer creation has strict imperative ordering (it depends on tileset add order), which a wrapper would obscure. The `@complete` callback on `<Tilemap>` already exposes the tilemap for direct `createLayer()` / `getObjectLayer()` calls.
