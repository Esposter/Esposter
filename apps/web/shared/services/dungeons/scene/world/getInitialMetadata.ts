import type { InitialMetadata } from "#shared/models/dungeons/data/world/InitialMetadata";
import type { SetOptional } from "type-fest";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { NotFoundError } from "@esposter/shared";
import { Direction } from "grid-engine-headless";

const TilemapInitialMetadataMap: Partial<Record<TilemapKey, SetOptional<InitialMetadata, "direction">>> = {
  [TilemapKey.Home]: { position: { x: 6, y: 21 } },
};
export const getInitialMetadata = (tilemapKey: TilemapKey): InitialMetadata => {
  const initialMetadata = TilemapInitialMetadataMap[tilemapKey];
  if (initialMetadata)
    return structuredClone({ ...initialMetadata, direction: initialMetadata.direction ?? Direction.Down });
  else throw new NotFoundError(getInitialMetadata.name, tilemapKey);
};
