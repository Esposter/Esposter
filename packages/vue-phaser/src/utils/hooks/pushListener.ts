import type { SceneKey } from "@/models/keys/SceneKey";
import type { Lifecycle } from "@/models/lifecycle/Lifecycle";
import type { SceneWithPlugins } from "vue-phaser";

import { useInjectSceneKey } from "@/composables/useInjectSceneKey";
import { ExternalSceneStore } from "@/store/scene";

export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void, key?: SceneKey) => {
  const sceneKey = key ?? useInjectSceneKey();
  ExternalSceneStore.lifeCycleListenersMap[lifecycle][sceneKey].push(listener);
};
