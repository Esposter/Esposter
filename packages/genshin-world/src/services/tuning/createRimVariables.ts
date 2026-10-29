import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";
import type { DevVariable } from "#src/models/dev/DevVariable";

import { LOOK_RIM_GROUP, TUNING_DOUBLE_UNIT_RANGE } from "#src/services/tuning/constants";
import { createColourVariable } from "#src/services/tuning/createColourVariable";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";

export const createRimVariables = ({ lightUniforms }: Pick<GenshinTuningOptions, "lightUniforms">): DevVariable[] => [
  createNumberVariable(lightUniforms.rimStrength, "value", {
    group: LOOK_RIM_GROUP,
    name: "rim strength",
    range: TUNING_DOUBLE_UNIT_RANGE,
  }),
  createColourVariable(lightUniforms.rimColor, { group: LOOK_RIM_GROUP, name: "rim colour" }),
];
