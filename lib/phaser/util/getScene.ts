import { useGame } from "@/lib/phaser/composables/useGame";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
// We need to get the scene manually instead of injecting the sceneKey here
// because scenes may be instantiated at various different complex times
// and are not always available, so we only want to grab the latest scene
// when we actually need to use it
export const getScene = (sceneKey: SceneKey) => {
  const game = useGame();
  return game.scene.getScene(sceneKey) as SceneWithPlugins;
};
