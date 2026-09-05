import type { Position } from "grid-engine";
import type { Tilemaps } from "phaser";

export const getObjectUnitPosition = (tilemap: Tilemaps.Tilemap, pixelPosition: Position): Position => ({
  x: pixelPosition.x / tilemap.tileWidth,
  // A Phaser object in Tiled carries the y of its tile's bottom edge, so the tile it sits on is one row up
  y: pixelPosition.y / tilemap.tileHeight - 1,
});
