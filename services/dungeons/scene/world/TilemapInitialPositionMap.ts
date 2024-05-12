import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { NotFoundError } from "@/models/error/NotFoundError";
import type { Position } from "grid-engine";

const TilemapInitialPositionMap: Partial<Record<TilemapKey, Position>> = {
  [TilemapKey.Home]: { x: 6, y: 21 },
};
export const getInitialPosition = (tilemapKey: TilemapKey) => {
  const initialPosition = TilemapInitialPositionMap[tilemapKey];
  if (!initialPosition) throw new NotFoundError(getInitialPosition.name, tilemapKey);
  return structuredClone(initialPosition);
};
