import type { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { ExternalSceneStore } from "#src/store/scene";

export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void, key?: string) => {
  const sceneKey = key ?? useInjectSceneKey();
  const listenersMap = ExternalSceneStore.lifecycleListenersMap.get(lifecycle);
  if (!listenersMap) {
    ExternalSceneStore.lifecycleListenersMap.set(lifecycle, new Map([[sceneKey, [listener]]]));
    return;
  }

  const listeners = listenersMap.get(sceneKey);
  if (listeners) listeners.push(listener);
  else listenersMap.set(sceneKey, [listener]);
};
