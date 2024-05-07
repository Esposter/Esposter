import { useInitializeControls } from "@/lib/phaser/composables/useInitializeControls";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { getScene } from "@/lib/phaser/util/getScene";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useSceneStore } from "@/store/dungeons/scene";

export const usePreviousScene = (currentSceneKey: SceneKey) => {
  const phaserStore = usePhaserStore();
  const { launchParallelScene, removeParallelScene } = phaserStore;
  const sceneStore = useSceneStore();
  const { previousSceneKeys } = storeToRefs(sceneStore);

  const launchScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    previousSceneKeys.value.push(currentSceneKey);
    scene.scene.pause(currentSceneKey);
    launchParallelScene(scene, sceneKey);
  };
  // This is a separate method to allow us to remove in-between scenes
  // e.g. Battle -> Inventory (remove this) -> MonsterParty
  // when an item has been used in monster party scene
  const removeScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    const index = previousSceneKeys.value.indexOf(sceneKey);
    if (index === -1) return;
    previousSceneKeys.value.splice(index, 1)[0];
    removeParallelScene(scene, sceneKey);
  };

  const switchToPreviousScene = (scene: SceneWithPlugins) => {
    const previousSceneKey = previousSceneKeys.value.pop();
    if (!previousSceneKey) return;
    const previousScene = getScene(previousSceneKey);
    removeParallelScene(scene, currentSceneKey);
    useInitializeControls(previousScene);
    scene.scene.resume(previousSceneKey);
  };

  return { launchScene, removeScene, switchToPreviousScene };
};
