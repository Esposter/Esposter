import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useSceneStore } from "@/store/dungeons/scene";
import { getScene, usePhaserStore } from "vue-phaserjs";

export const usePreviousScene = (currentSceneKey: SceneKey) => {
  const phaserStore = usePhaserStore();
  const { launchParallelScene, removeParallelScene } = phaserStore;
  const sceneStore = useSceneStore();
  const { popSceneKeysAbove } = sceneStore;
  const { previousSceneKey, previousSceneKeyStack } = storeToRefs(sceneStore);

  const launchScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    previousSceneKeyStack.value.push(currentSceneKey);
    scene.scene.pause(currentSceneKey);
    launchParallelScene(scene, sceneKey);
  };
  // Removes every in-between scene stacked above `sceneKey` — Battle -> Inventory (removed) -> MonsterParty, which
  // Is what using an item in the monster party scene leaves behind — so switching back lands on it directly
  // Rather than flashing through each of them
  const removeScenesAbove = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    const poppedSceneKeys = popSceneKeysAbove(sceneKey);
    for (const poppedSceneKey of poppedSceneKeys) removeParallelScene(scene, poppedSceneKey);
  };

  const switchToPreviousScene = (scene: SceneWithPlugins) => {
    const poppedSceneKey = previousSceneKeyStack.value.pop();
    if (!poppedSceneKey) return;
    const previousScene = getScene(poppedSceneKey);
    removeParallelScene(scene, currentSceneKey);
    useInitializeControls(previousScene);
    scene.scene.resume(poppedSceneKey);
  };

  return { launchScene, previousSceneKey, removeScenesAbove, switchToPreviousScene };
};
