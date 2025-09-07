import type { SceneWithPlugins } from "vue-phaserjs";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { ObjectInteractionEffectMap } from "@/services/dungeons/scene/world/interaction/effect/ObjectInteractionEffectMap";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useInteractWithObject = async (scene: SceneWithPlugins): Promise<boolean> => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey } = storeToRefs(worldSceneStore);
  const objectLayerMap = ExternalWorldSceneStore.tilemapKeyObjectLayerMap.get(tilemapKey.value);
  if (!objectLayerMap) return false;

  for (const objectgroupName of Object.values(ObjectgroupName)) {
    const objectLayer = objectLayerMap.get(objectgroupName);
    if (!objectLayer) continue;

    const objects = getObjects(objectLayer);
    if (await ObjectInteractionEffectMap[objectgroupName]?.(scene, objects)) return true;
  }

  return false;
};
