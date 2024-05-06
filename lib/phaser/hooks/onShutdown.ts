import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShutdown = (listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  const sceneStore = useSceneStore();
  const { shutdownListenersMap } = storeToRefs(sceneStore);
  pushListener(shutdownListenersMap, listener, sceneKey);
};
