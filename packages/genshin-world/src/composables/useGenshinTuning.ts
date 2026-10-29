import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { createLookVariables } from "#src/services/tuning/createLookVariables";
import { until } from "@vueuse/core";

// Registers the look's variables with the development registry once the post pipeline is drawn, and removes them with the
// Scene that shows it
export const useGenshinTuning = ({ devRegistry, postPipeline, ...options }: GenshinTuningOptions) => {
  let isActive = true;
  let unregister: (() => void) | undefined;

  // oxlint-disable-next-line typescript/no-misused-promises, typescript/strict-void-return -- Vue awaits a lifecycle hook's returned promise and routes its rejection to the app's error handler
  onMounted(async () => {
    const pipeline = await until(postPipeline).toBeTruthy();
    if (!isActive) return;
    unregister = devRegistry.register({ commands: [], variables: createLookVariables(options, pipeline) });
  });

  onUnmounted(() => {
    isActive = false;
    unregister?.();
  });
};
