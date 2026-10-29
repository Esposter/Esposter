import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";
import type { DevVariable } from "#src/models/dev/DevVariable";

import { LOOK_WIND_GROUP, TUNING_DOUBLE_UNIT_RANGE } from "#src/services/tuning/constants";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";

export const createWindVariables = ({ windUniforms }: Pick<GenshinTuningOptions, "windUniforms">): DevVariable[] => [
  createNumberVariable(windUniforms.strength, "value", {
    group: LOOK_WIND_GROUP,
    name: "wind strength",
    range: TUNING_DOUBLE_UNIT_RANGE,
  }),
  createNumberVariable(windUniforms.gustStrength, "value", {
    group: LOOK_WIND_GROUP,
    name: "wind gust strength",
    range: TUNING_DOUBLE_UNIT_RANGE,
  }),
  createNumberVariable(windUniforms.gustWidth, "value", {
    group: LOOK_WIND_GROUP,
    name: "wind gust width",
    range: { max: 100, min: 1, step: 1 },
  }),
  createNumberVariable(windUniforms.gustSpeed, "value", {
    group: LOOK_WIND_GROUP,
    name: "wind gust speed",
    range: { max: 30, min: 0, step: 0.1 },
  }),
];
