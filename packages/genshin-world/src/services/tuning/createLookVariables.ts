import type { DevVariable } from "#src/models/dev/DevVariable";
import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";
import type { PostPipeline } from "genshin-engine";
import type { Except } from "type-fest";

import { createBloomVariables } from "#src/services/tuning/createBloomVariables";
import { createFogVariables } from "#src/services/tuning/createFogVariables";
import { createGodRaysVariables } from "#src/services/tuning/createGodRaysVariables";
import { createGradeVariables } from "#src/services/tuning/createGradeVariables";
import { createOutlineVariables } from "#src/services/tuning/createOutlineVariables";
import { createRampVariables } from "#src/services/tuning/createRampVariables";
import { createRimVariables } from "#src/services/tuning/createRimVariables";
import { createSkyVariables } from "#src/services/tuning/createSkyVariables";
import { createWaterVariables } from "#src/services/tuning/createWaterVariables";
import { createWindVariables } from "#src/services/tuning/createWindVariables";

// The look's every uniform as a development variable, in the panel's sections of it, so the hour, clouds, wind, ramp, rim,
// Outline, fog, water, grade, god rays and bloom are set against reference screenshots rather than guessed. A ramp or a
// Grade is written into its texture at once; nothing is saved, and a value that looks right is copied into the region's
// Constants
export const createLookVariables = (
  options: Except<
    GenshinTuningOptions,
    "devRegistry" | "getRenderer" | "isTemporalAntialiasingOn" | "postPipeline" | "sun"
  >,
  { bloomNode, godraysNode }: Pick<PostPipeline, "bloomNode" | "godraysNode">,
): DevVariable[] => [
  ...createSkyVariables(options),
  ...createWindVariables(options),
  ...createRampVariables(options),
  ...createRimVariables(options),
  ...createOutlineVariables(options),
  ...createFogVariables(options),
  ...createWaterVariables(options),
  ...createGradeVariables(options),
  ...createGodRaysVariables({ godraysNode, postUniforms: options.postUniforms }),
  ...createBloomVariables({ bloomNode }),
];
