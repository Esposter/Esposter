import type { ListenersMap } from "#src/models/lifecycle/ListenersMap";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import { ExternalSceneStore } from "#src/store/ExternalSceneStore";
import { getOrCreate } from "@esposter/shared";

// Returns the function that removes the listener early. A listener pushed from a component's setup is removed when the
// Component unmounts, so it cannot reach a destroyed component. A shutdown is the exception: it is the scene's teardown,
// And what a component set up in it (a slider's destroy, a map's camera bounds) outlives that component
export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void, key?: string) => {
  const sceneKey = key ?? useInjectSceneKey();
  const listenersMap: ListenersMap = getOrCreate(ExternalSceneStore.lifecycleListenersMap, lifecycle, () => new Map());
  getOrCreate(listenersMap, sceneKey, () => []).push(listener);

  const removeListener = () => {
    listenersMap.set(
      sceneKey,
      (listenersMap.get(sceneKey) ?? []).filter((existingListener) => existingListener !== listener),
    );
  };
  if (lifecycle !== Lifecycle.Shutdown && getCurrentScope()) onScopeDispose(removeListener);
  return removeListener;
};
