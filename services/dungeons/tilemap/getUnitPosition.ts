import { TILE_SIZE } from "@/services/dungeons/world/constants";
import { type Position } from "grid-engine";

export const getUnitPosition = (pixelPosition: Position): Position => ({
  x: pixelPosition.x / TILE_SIZE,
  // Phaser objects in Tiled have y values set to the bottom of that tile
  // so we need to minus 1 to account for that
  y: pixelPosition.y / TILE_SIZE - 1,
});
