import type { DevVariable } from "#src/models/dev/DevVariable";
import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { LOOK_WATER_GROUP, TUNING_DOUBLE_UNIT_RANGE } from "#src/services/tuning/constants";
import { createColourVariable } from "#src/services/tuning/createColourVariable";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";

export const createWaterVariables = ({ waterUniforms }: Pick<GenshinTuningOptions, "waterUniforms">): DevVariable[] => [
  createNumberVariable(waterUniforms.level, "value", {
    group: LOOK_WATER_GROUP,
    name: "water level",
    range: { max: 20, min: -20, step: 0.1 },
  }),
  createColourVariable(waterUniforms.shallowColor, { group: LOOK_WATER_GROUP, name: "water shallow colour" }),
  createColourVariable(waterUniforms.deepColor, { group: LOOK_WATER_GROUP, name: "water deep colour" }),
  createNumberVariable(waterUniforms.deepDepth, "value", {
    group: LOOK_WATER_GROUP,
    name: "water deep depth",
    range: { max: 30, min: 0.5, step: 0.1 },
  }),
  createNumberVariable(waterUniforms.foamDepth, "value", {
    group: LOOK_WATER_GROUP,
    name: "water foam depth",
    range: { max: 3, min: 0, step: 0.01 },
  }),
  createNumberVariable(waterUniforms.causticStrength, "value", {
    group: LOOK_WATER_GROUP,
    name: "water caustics",
    range: TUNING_DOUBLE_UNIT_RANGE,
  }),
  createColourVariable(waterUniforms.underwaterFogColor, {
    group: LOOK_WATER_GROUP,
    name: "water underwater fog colour",
  }),
  createNumberVariable(waterUniforms.underwaterFogDensity, "value", {
    group: LOOK_WATER_GROUP,
    name: "water underwater fog density",
    range: { max: 0.5, min: 0, step: 0.001 },
  }),
];
