import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { createLookVariables } from "#src/services/tuning/createLookVariables";
import { until } from "@vueuse/core";

// Development's tuning look: every uniform of the look is registered with the development registry once the post pipeline
// Is drawn, so the panel's Look tab sets it at once, and it is removed with the scene that shows it
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
