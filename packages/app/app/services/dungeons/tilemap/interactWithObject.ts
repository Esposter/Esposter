import type { SceneWithPlugins } from "vue-phaserjs";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { ObjectInteractionEffectMap } from "@/services/dungeons/scene/world/interaction/effect/ObjectInteractionEffectMap";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";

export const interactWithObject = async (scene: SceneWithPlugins): Promise<boolean> => {
  for (const objectgroupName of Object.values(ObjectgroupName)) {
    const objectLayer = ExternalWorldSceneStore.objectLayerMap.get(objectgroupName);
    if (!objectLayer) continue;

    const objects = getObjects(objectLayer);
    if (await ObjectInteractionEffectMap[objectgroupName]?.(scene, objects)) return true;
  }

  return false;
};
