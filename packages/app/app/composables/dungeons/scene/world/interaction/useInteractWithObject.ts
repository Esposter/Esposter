import type { SceneWithPlugins } from "vue-phaserjs";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { ObjectInteractionEffectMap } from "@/services/dungeons/scene/world/interaction/effect/ObjectInteractionEffectMap";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useInteractWithObject = async (scene: SceneWithPlugins): Promise<boolean> => {
  const worldSceneStore = useWorldSceneStore();
  const { objectLayerMap, tilemap } = storeToRefs(worldSceneStore);
  if (!objectLayerMap.value) return false;

  for (const objectgroupName of Object.values(ObjectgroupName)) {
    const objectLayer = objectLayerMap.value.get(objectgroupName);
    if (!objectLayer) continue;

    const objects = getObjects(tilemap.value, objectLayer);
    if (await ObjectInteractionEffectMap[objectgroupName]?.(scene, objects)) return true;
  }

  return false;
};
