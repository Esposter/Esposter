import type { Tilemaps } from "phaser";

import { TileProperty } from "#src/models/dungeons/tilemap/TileProperty";

// A cell's collision as the collision read sees it: an empty cell is absent, and a tile blocks when its property is set
export const readCollisionTile = (tile: null | Tilemaps.Tile) =>
  tile === null ? undefined : Boolean(tile.properties[TileProperty.Collision]);
