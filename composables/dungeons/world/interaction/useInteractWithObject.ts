import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { ObjectInteractionEffectMap } from "@/services/dungeons/scene/world/interaction/ObjectInteractionEffectMap";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";
import type { Types } from "phaser";
import type { SetRequired } from "type-fest";

export const useInteractWithObject = (scene: SceneWithPlugins): boolean => {
  const worldSceneStore = useWorldSceneStore();
  const { objectLayerMap } = storeToRefs(worldSceneStore);

  for (const objectgroupName of Object.values(ObjectgroupName)) {
    const objects: SetRequired<Types.Tilemaps.TiledObject, keyof Position>[] = [];

    for (const { x, y, ...rest } of objectLayerMap.value[objectgroupName].objects) {
      if (!(x && y)) continue;
      objects.push({ ...useObjectUnitPosition({ x, y }), ...rest });
    }

    if (ObjectInteractionEffectMap[objectgroupName](scene, objects)) return true;
  }

  return false;
};
