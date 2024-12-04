import type { Lifecycle } from "@/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { ExternalSceneStore } from "@/store/scene";
import { resetLifecycleListeners } from "@/util/hooks/resetLifecycleListeners";

export const runLifecycleListeners = (scene: SceneWithPlugins, lifecycle: Lifecycle, isReset = true) => {
  const listenersMap = ExternalSceneStore.lifecycleListenersMap.get(lifecycle);
  if (!listenersMap) return;

  const listeners = listenersMap.get(scene.scene.key);
  if (!listeners) return;

  for (const listener of listeners) listener(scene);

  if (isReset) resetLifecycleListeners(scene, lifecycle);
};
