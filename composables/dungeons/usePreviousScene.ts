import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useSceneStore } from "@/store/dungeons/scene";

export const usePreviousScene = (currentSceneKey: SceneKey) => {
  const phaserStore = usePhaserStore();
  const { launchParallelScene, removeParallelScene } = phaserStore;
  const { scene } = storeToRefs(phaserStore);
  const sceneStore = useSceneStore();
  const { previousSceneKeys } = storeToRefs(sceneStore);

  const launchScene = (sceneKey: SceneKey) => {
    previousSceneKeys.value.push(currentSceneKey);
    scene.value.scene.pause(currentSceneKey);
    launchParallelScene(sceneKey);
  };
  // This is a separate method to allow us to remove in-between scenes
  // e.g. Battle -> Inventory (remove this) -> MonsterParty
  // when an item has been used in monster party scene
  const removeScene = (sceneKey: SceneKey) => {
    const index = previousSceneKeys.value.indexOf(sceneKey);
    if (index === -1) return;

    previousSceneKeys.value.splice(index, 1)[0];
    removeParallelScene(sceneKey);
  };

  const switchToPreviousScene = () => {
    if (previousSceneKeys.value.length === 0) return;
    const previousSceneKey = previousSceneKeys.value.pop();
    removeParallelScene(currentSceneKey);
    scene.value.scene.resume(previousSceneKey);
  };

  return { launchScene, removeScene, switchToPreviousScene };
};
