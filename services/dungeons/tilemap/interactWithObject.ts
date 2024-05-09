import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { ObjectInteractionEffectMap } from "@/services/dungeons/scene/world/interaction/ObjectInteractionEffectMap";
import { getObjectUnitPosition } from "@/services/dungeons/tilemap/getObjectUnitPosition";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";
import type { Types } from "phaser";
import type { SetRequired } from "type-fest";

export const interactWithObject = (scene: SceneWithPlugins): boolean => {
  for (const objectgroupName of Object.values(ObjectgroupName)) {
    const objects: SetRequired<Types.Tilemaps.TiledObject, keyof Position>[] = [];

    for (const { x, y, ...rest } of ExternalWorldSceneStore.objectLayerMap[objectgroupName]?.objects ?? []) {
      if (!(x && y)) continue;
      objects.push({ ...getObjectUnitPosition({ x, y }), ...rest });
    }

    if (ObjectInteractionEffectMap[objectgroupName]?.(scene, objects)) return true;
  }

  return false;
};
