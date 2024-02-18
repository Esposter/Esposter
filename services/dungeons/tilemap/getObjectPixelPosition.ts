import { TILE_SIZE } from "@/services/dungeons/world/constants";
import { type Position } from "grid-engine";
// This is the inverse of getObjectUnitPosition
export const getObjectPixelPosition = (unitPosition: Position): Position => ({
  x: unitPosition.x * TILE_SIZE,
  y: (unitPosition.y + 1) * TILE_SIZE,
});
