import type { SceneKey } from "@/models/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaser";

import { useGame } from "@/composables/useGame";
// We need to get the scene manually instead of injecting the sceneKey here
// because scenes may be instantiated at various different complex times
// and are not always available, so we only want to grab the latest scene
// when we actually need to use it
export const getScene = (sceneKey: SceneKey) => {
  const game = useGame();
  return game.scene.getScene(sceneKey) as SceneWithPlugins;
};
