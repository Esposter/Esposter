import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import { resetLifecycleListeners } from "#src/services/hooks/resetLifecycleListeners";
import { runLifecycleListeners } from "#src/services/hooks/runLifecycleListeners";
import { ExternalSceneStore } from "#src/store/scene";
// The per-frame listeners are dropped rather than run: a scene shutting down has no next tick to spend them on
export const runSceneShutdown = (scene: SceneWithPlugins) => {
  resetLifecycleListeners(scene, Lifecycle.Update);
  resetLifecycleListeners(scene, Lifecycle.NextTick);
  runLifecycleListeners(scene, Lifecycle.Shutdown);
  ExternalSceneStore.sceneReadyMap.set(scene.scene.key, false);
};
