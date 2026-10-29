import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { createLookVariables } from "#src/services/tuning/createLookVariables";
import { createPassVariables } from "#src/services/tuning/createPassVariables";
import { until } from "@vueuse/core";

// Registers the look's variables, and the passes the world can switch off, with the development registry once the post
// Pipeline is drawn, along with the renderer the stats overlay reads; all are removed with the scene that shows them
export const useGenshinTuning = ({ devRegistry, postPipeline, ...options }: GenshinTuningOptions) => {
  let isActive = true;
  let unregister: (() => void) | undefined;

  // oxlint-disable-next-line typescript/no-misused-promises, typescript/strict-void-return -- Vue awaits a lifecycle hook's returned promise and routes its rejection to the app's error handler
  onMounted(async () => {
    const pipeline = await until(postPipeline).toBeTruthy();
    if (!isActive) return;
    unregister = devRegistry.register({
      commands: [],
      renderer: options.getRenderer,
      variables: [...createLookVariables(options, pipeline), ...createPassVariables(options)],
    });
  });

  onUnmounted(() => {
    isActive = false;
    unregister?.();
  });
};
