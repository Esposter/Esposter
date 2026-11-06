import type { GenshinTuningOptions } from "#src/models/tuning/GenshinTuningOptions";

import { useDevRegistration } from "#src/composables/useDevRegistration";
import { createLookVariables } from "#src/services/tuning/createLookVariables";
import { createPassVariables } from "#src/services/tuning/createPassVariables";
import { until } from "@vueuse/core";

// Registers the look's variables, and the passes the world can switch off, with the development registry once the post
// Pipeline is drawn, along with the renderer the stats overlay reads; all are removed with the scene that shows them
export const useGenshinTuning = ({ devRegistry, postPipeline, ...options }: GenshinTuningOptions) => {
  useDevRegistration({
    createHandle: async () => {
      const pipeline = await until(postPipeline).toBeTruthy();
      return {
        commands: [],
        renderer: options.getRenderer,
        variables: [...createLookVariables(options, pipeline), ...createPassVariables(options)],
      };
    },
    devRegistry,
  });
};
