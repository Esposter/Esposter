import type { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { ExternalSceneStore } from "@/lib/phaser/store/scene";

export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void, key?: SceneKey) => {
  const sceneKey = key ?? useInjectSceneKey();
  ExternalSceneStore.lifeCycleListenersMap[lifecycle][sceneKey].push(listener);
};
