import type { TeleportTarget } from "#shared/generated/tiled/propertyTypes/class/TeleportTarget";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { Position } from "grid-engine-headless";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { TeleportObjectProperty } from "#shared/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import { TilemapAssetMap } from "#src/services/dungeons/loader/TilemapAssetMap";
import { getObjectUnitPosition } from "#src/services/dungeons/tilemap/getObjectUnitPosition";
import { getTiledObjectProperty } from "#src/services/dungeons/tilemap/getTiledObjectProperty";
import { NotFoundError } from "@esposter/shared";

// A door's tile, read from its tilemap's own data rather than the loaded tilemap, so the player can be placed on the
// Tilemap in the same write that switches to it, before the tilemap has been built
export const getDoorPosition = (tilemapKey: TilemapKey, doorId: TeleportTarget["id"]): Position => {
  const { layers, tileheight, tilewidth } = TilemapAssetMap[tilemapKey];
  const doorObjects = layers.find((layer) => layer.name === ObjectgroupName.Door)?.objects ?? [];
  for (const { properties, x, y } of doorObjects) {
    const idTiledObjectProperty = getTiledObjectProperty<TeleportTarget["id"]>(properties, TeleportObjectProperty.Id);
    if (idTiledObjectProperty.value === doorId)
      return getObjectUnitPosition({ tileHeight: tileheight, tileWidth: tilewidth }, { x, y });
  }
  throw new NotFoundError(getDoorPosition.name, doorId);
};
