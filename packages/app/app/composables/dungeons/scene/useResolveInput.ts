import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useControlsStore } from "@/store/dungeons/controls";

// The scene update loop every input-driven scene runs: read this frame's input once, then offer it to each
// Resolver in priority order and stop at the first that claims it. Order is the scene's, in its own
// `getActiveInputResolvers`; the dispatch is not, and a scene that reimplements it is one `return` away from
// Running two resolvers on one keypress
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
