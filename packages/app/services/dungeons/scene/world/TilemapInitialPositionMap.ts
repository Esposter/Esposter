import type { Position } from "grid-engine";
import type { PartialByKeys } from "unocss";

import { TilemapKey } from "@/shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { NotFoundError } from "@esposter/shared";
import { Direction } from "grid-engine";

interface InitialMetadata {
  direction: Direction;
  position: Position;
}

const TilemapInitialMetadataMap: Partial<Record<TilemapKey, PartialByKeys<InitialMetadata, "direction">>> = {
  [TilemapKey.Home]: { position: { x: 6, y: 21 } },
};
export const getInitialMetadata = (tilemapKey: TilemapKey): InitialMetadata => {
  const initialMetadata = TilemapInitialMetadataMap[tilemapKey];
  if (!initialMetadata) throw new NotFoundError(getInitialMetadata.name, tilemapKey);
  return structuredClone({ ...initialMetadata, direction: initialMetadata.direction ?? Direction.DOWN });
};
