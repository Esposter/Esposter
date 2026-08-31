import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useControlsStore } from "@/store/dungeons/controls";
import { getResultAsync, noop } from "@esposter/shared";

// Reads this frame's input once, then offers it to each resolver in priority order and stops at the first that
// Claims it — so one keypress never reaches two resolvers. The order is the scene's own, in its
// `getActiveInputResolvers`
export const useResolveInput = (inputResolvers: AInputResolver[]) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  // The scene's update event is the frame loop, which drops whatever its listener returns — so the resolution
  // Reports its own failure rather than leaving one rejection per frame with no handler
  return (scene: SceneWithPlugins) =>
    getResultAsync(async () => {
      const justDownInput = controls.value.getInput(true);
      const input = controls.value.getInput();
      for (const inputResolver of inputResolvers)
        if (await inputResolver.handleInput(scene, justDownInput, input)) return;
    }).match(noop, console.error);
};
