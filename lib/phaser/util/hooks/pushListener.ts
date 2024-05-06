import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import type { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { ExternalSceneStore } from "@/lib/phaser/store/phaser/scene";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void) => {
  const sceneKey = useInjectSceneKey();
  ExternalSceneStore.lifeCycleListenersMap[lifecycle][sceneKey].push(listener);
};
