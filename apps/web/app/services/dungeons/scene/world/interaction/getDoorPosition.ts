import type { TeleportTarget } from "#shared/generated/tiled/propertyTypes/class/TeleportTarget";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TiledMapData } from "#src/models/dungeons/tilemap/TiledMapData";
import type { Position } from "grid-engine-headless";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { TeleportObjectProperty } from "#shared/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import { getObjectUnitPosition } from "#src/services/dungeons/tilemap/getObjectUnitPosition";
import { getTiledObjectProperty } from "#src/services/dungeons/tilemap/getTiledObjectProperty";
import { NotFoundError } from "@esposter/shared";

// A door's tile, read from its tilemap's Tiled JSON as the preload cached it rather than the built tilemap, so the
// Player can be placed on the tilemap in the same write that switches to it, before the tilemap has been built
export const getDoorPosition = (
  scene: SceneWithPlugins,
  tilemapKey: TilemapKey,
  doorId: TeleportTarget["id"],
): Position => {
  const { layers, tileheight, tilewidth }: TiledMapData = scene.cache.tilemap.get(tilemapKey).data;
  const doorObjects = layers.find((layer) => layer.name === ObjectgroupName.Door)?.objects ?? [];
  for (const { properties, x, y } of doorObjects) {
    const idTiledObjectProperty = getTiledObjectProperty<TeleportTarget["id"]>(properties, TeleportObjectProperty.Id);
    if (idTiledObjectProperty.value === doorId)
      return getObjectUnitPosition({ tileHeight: tileheight, tileWidth: tilewidth }, { x, y });
  }
  throw new NotFoundError(getDoorPosition.name, doorId);
};
