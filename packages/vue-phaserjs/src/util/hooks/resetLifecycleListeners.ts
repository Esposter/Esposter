import type { Lifecycle } from "@/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { ExternalSceneStore } from "@/store/scene";

export const resetLifecycleListeners = (scene: SceneWithPlugins, lifecycle: Lifecycle) => {
  const listenersMap = ExternalSceneStore.lifecycleListenersMap.get(lifecycle);
  if (!listenersMap?.has(scene.scene.key)) return;

  listenersMap.set(scene.scene.key, []);
};
