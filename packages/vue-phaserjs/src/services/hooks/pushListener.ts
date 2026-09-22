import type { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { ExternalSceneStore } from "#src/store/scene";
import { getOrCreate } from "@esposter/shared";

export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void, key?: string) => {
  const sceneKey = key ?? useInjectSceneKey();
  const listenersMap = getOrCreate(ExternalSceneStore.lifecycleListenersMap, lifecycle, () => new Map());
  getOrCreate(listenersMap, sceneKey, () => []).push(listener);
};
