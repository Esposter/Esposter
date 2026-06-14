import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { useGame } from "@/composables/useGame";
// Resolve the scene manually rather than injecting the sceneKey: scenes are created at varying,
// Complex times and aren't always available, so we grab the latest one only when we need it.
export const getScene = (sceneKey: SceneWithPlugins["scene"]["key"]): SceneWithPlugins => {
  const game = useGame();
  return game.scene.getScene(sceneKey);
};
