import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
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
  // Removes an in-between scene from the stack — Battle -> Inventory (removed) -> MonsterParty, which is what
  // Using an item in the monster party scene leaves behind
  const removeScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    const index = previousSceneKeyStack.value.indexOf(sceneKey);
    if (index === -1) return;
    previousSceneKeyStack.value = previousSceneKeyStack.value.toSpliced(index, 1);
    removeParallelScene(scene, sceneKey);
  };

  const switchToPreviousScene = (scene: SceneWithPlugins) => {
    const poppedSceneKey = previousSceneKeyStack.value.pop();
    if (!poppedSceneKey) return;
    const previousScene = getScene(poppedSceneKey);
    removeParallelScene(scene, currentSceneKey);
    useInitializeControls(previousScene);
    scene.scene.resume(poppedSceneKey);
  };

  return { launchScene, previousSceneKey, removeScene, switchToPreviousScene };
};
