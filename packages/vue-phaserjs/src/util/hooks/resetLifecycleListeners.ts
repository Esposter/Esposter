import type { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { ExternalSceneStore } from "#src/store/scene";

export const resetLifecycleListeners = (scene: SceneWithPlugins, lifecycle: Lifecycle) => {
  const listenersMap = ExternalSceneStore.lifecycleListenersMap.get(lifecycle);
  if (!listenersMap?.has(scene.scene.key)) return;

  listenersMap.set(scene.scene.key, []);
};
