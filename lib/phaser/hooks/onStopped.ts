import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onStopped = (listener: (scene: SceneWithPlugins) => void) => {
  const sceneStore = useSceneStore();
  const { stopListeners } = storeToRefs(sceneStore);
  stopListeners.value.push(listener);
};
