import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { Position } from "grid-engine";

export const TilemapInitialPositionMap: Partial<Record<TilemapKey, Position>> = {
  [TilemapKey.Home]: { x: 6, y: 21 },
};
