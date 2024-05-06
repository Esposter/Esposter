import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShutdown = (listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  const sceneStore = useSceneStore();
  const { lifeCycleListenersMap } = storeToRefs(sceneStore);
  pushListener(lifeCycleListenersMap.value[Lifecycle.Shutdown], listener, sceneKey);
};
