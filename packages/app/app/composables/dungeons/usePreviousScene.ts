import type { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useSceneStore } from "@/store/dungeons/scene";
import { getScene, usePhaserStore } from "vue-phaserjs";

export const usePreviousScene = (currentSceneKey: SceneKey) => {
  const phaserStore = usePhaserStore();
  const { launchParallelScene, removeParallelScene } = phaserStore;
  const sceneStore = useSceneStore();
  const { previousSceneKey, previousSceneKeyStack } = storeToRefs(sceneStore);

  const launchScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    previousSceneKeyStack.value.push(currentSceneKey);
    scene.scene.pause(currentSceneKey);
    launchParallelScene(scene, sceneKey);
  };
  // This is a separate method to allow us to remove in-between scenes
  // e.g. Battle -> Inventory (remove this) -> MonsterParty
  // when an item has been used in monster party scene
  const removeScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    const index = previousSceneKeyStack.value.indexOf(sceneKey);
    if (index === -1) return;
    previousSceneKeyStack.value.splice(index, 1);
    removeParallelScene(scene, sceneKey);
  };

  const switchToPreviousScene = (scene: SceneWithPlugins) => {
    const previousSceneKey = previousSceneKeyStack.value.pop();
    if (!previousSceneKey) return;
    const previousScene = getScene(previousSceneKey);
    removeParallelScene(scene, currentSceneKey);
    useInitializeControls(previousScene);
    scene.scene.resume(previousSceneKey);
  };

  return { launchScene, previousSceneKey, removeScene, switchToPreviousScene };
};
