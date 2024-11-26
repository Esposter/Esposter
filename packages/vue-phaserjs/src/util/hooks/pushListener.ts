import type { Lifecycle } from "@/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { useInjectSceneKey } from "@/composables/useInjectSceneKey";
import { ExternalSceneStore } from "@/store/scene";

export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void, key?: string) => {
  const sceneKey = key ?? useInjectSceneKey();
  const listenersMap = ExternalSceneStore.lifecycleListenersMap.get(lifecycle);
  if (!listenersMap) {
    ExternalSceneStore.lifecycleListenersMap.set(lifecycle, new Map([[sceneKey, [listener]]]));
    return;
  }

  const listeners = listenersMap.get(sceneKey);
  if (!listeners) listenersMap.set(sceneKey, [listener]);
  else listeners.push(listener);
};
