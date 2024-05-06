import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onCreate = (listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  const sceneStore = useSceneStore();
  const { createListenersMap } = storeToRefs(sceneStore);
  pushListener(createListenersMap, listener, sceneKey);
};
