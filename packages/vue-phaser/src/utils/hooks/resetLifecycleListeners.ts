import type { Lifecycle } from "@/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { ExternalSceneStore } from "@/store/scene";

export const resetLifecycleListeners = (scene: SceneWithPlugins, lifecycle: Lifecycle) => {
  const listenersMap = ExternalSceneStore.lifecycleListenersMap.get(lifecycle);
  if (!listenersMap) return;

  const listeners = listenersMap.get(scene.scene.key);
  if (!listeners) return;

  listenersMap.set(scene.scene.key, []);
};
