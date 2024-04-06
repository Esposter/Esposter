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

  const switchToPreviousScene = () => {
    if (previousSceneKeys.value.length === 0) return;
    const previousSceneKey = previousSceneKeys.value.pop();
    removeParallelScene(currentSceneKey);
    scene.value.scene.resume(previousSceneKey);
  };

  return { launchScene, switchToPreviousScene };
};
