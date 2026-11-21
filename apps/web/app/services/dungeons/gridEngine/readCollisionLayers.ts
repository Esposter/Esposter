import type { CollisionLayer } from "#src/models/dungeons/tilemap/CollisionLayer";
import type { Tilemaps } from "phaser";

import { readCollisionTile } from "#src/services/dungeons/gridEngine/readCollisionTile";

// Every layer of a tilemap read into its collision, position by position. A layer that was never drawn has no tilemap
// Layer, which the grid read refuses by its name
export const readCollisionLayers = (tilemap: Tilemaps.Tilemap): CollisionLayer[] =>
  tilemap.layers.map((layer, layerIndex) => ({
    hasTilemapLayer: layer.tilemapLayer !== undefined,
    name: layer.name,
    tiles: Array.from({ length: tilemap.height }, (_row, y) =>
      Array.from({ length: tilemap.width }, (_cell, x) =>
        readCollisionTile(tilemap.getTileAt(x, y, false, layerIndex)),
      ),
    ),
  }));
