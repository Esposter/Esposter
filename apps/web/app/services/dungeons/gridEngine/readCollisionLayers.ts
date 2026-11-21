import type { CollisionLayer } from "#src/models/dungeons/tilemap/CollisionLayer";
import type { Tilemaps } from "phaser";

import { readCollisionTile } from "#src/services/dungeons/gridEngine/readCollisionTile";

// Every layer of a tilemap read into its collision, position by position. A layer that was never drawn has no tilemap
// Layer, which Phaser's layer data holds as null, and the grid read refuses it by its name
export const readCollisionLayers = (tilemap: Tilemaps.Tilemap): CollisionLayer[] =>
  tilemap.layers.map((layer, layerIndex) => ({
    hasTilemapLayer: Boolean(layer.tilemapLayer),
    name: layer.name,
    tiles: Array.from({ length: tilemap.height }, (_row, y) =>
      Array.from({ length: tilemap.width }, (_cell, x) =>
        readCollisionTile(tilemap.getTileAt(x, y, false, layerIndex)),
      ),
    ),
  }));
