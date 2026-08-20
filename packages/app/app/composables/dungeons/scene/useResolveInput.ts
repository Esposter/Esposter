import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useControlsStore } from "@/store/dungeons/controls";

// Reads this frame's input once, then offers it to each resolver in priority order and stops at the first that
// Claims it — so one keypress never reaches two resolvers. The order is the scene's own, in its
// `getActiveInputResolvers`
export const useResolveInput = (inputResolvers: AInputResolver[]) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  return async (scene: SceneWithPlugins) => {
    const justDownInput = controls.value.getInput(true);
    const input = controls.value.getInput();
    for (const inputResolver of inputResolvers)
      if (await inputResolver.handleInput(scene, justDownInput, input)) return;
  };
};
