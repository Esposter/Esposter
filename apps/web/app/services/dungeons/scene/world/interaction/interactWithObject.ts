import type { SceneWithPlugins } from "vue-phaserjs";

import { getObjects } from "#src/services/dungeons/scene/world/getObjects";
import { ObjectInteractionEffectMap } from "#src/services/dungeons/scene/world/interaction/effect/ObjectInteractionEffectMap";
import { OBJECTGROUP_NAMES } from "#src/services/dungeons/tilemap/constants";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";

export const interactWithObject = async (scene: SceneWithPlugins) => {
  const worldSceneStore = useWorldSceneStore();
  const { objectLayerMap, tilemap } = storeToRefs(worldSceneStore);
  if (!objectLayerMap.value) return false;

  for (const objectgroupName of OBJECTGROUP_NAMES) {
    const objectLayer = objectLayerMap.value.get(objectgroupName);
    if (!objectLayer) continue;

    const objects = getObjects(tilemap.value, objectLayer);
    // Each effect runs in turn, and the first one that consumes the interaction ends it.
    // oxlint-disable-next-line no-await-in-loop -- Stop at the first: the next effect waits on this one
    if (await ObjectInteractionEffectMap[objectgroupName]?.(scene, objects)) return true;
  }

  return false;
};
