import type { Position } from "grid-engine";
import type { Tilemaps } from "phaser";

export const getObjectUnitPosition = (tilemap: Tilemaps.Tilemap, pixelPosition: Position): Position => ({
  x: pixelPosition.x / tilemap.tileWidth,
  // Phaser objects in Tiled have y values set to the bottom of that tile
  // so we need to minus 1 to account for that
  y: pixelPosition.y / tilemap.tileHeight - 1,
});
