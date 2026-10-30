import type { DevVariable } from "#src/models/dev/DevVariable";
import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { LOOK_FOG_GROUP } from "#src/services/tuning/constants";
import { createColourVariable } from "#src/services/tuning/createColourVariable";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";

export const createFogVariables = ({ fogUniforms }: Pick<GenshinTuningOptions, "fogUniforms">): DevVariable[] => [
  createNumberVariable(fogUniforms.density, "value", {
    group: LOOK_FOG_GROUP,
    name: "fog density",
    range: { max: 0.01, min: 0, step: 0.0001 },
  }),
  createNumberVariable(fogUniforms.heightFalloff, "value", {
    group: LOOK_FOG_GROUP,
    name: "fog height falloff",
    range: { max: 0.2, min: 0, step: 0.001 },
  }),
  createNumberVariable(fogUniforms.baseHeight, "value", {
    group: LOOK_FOG_GROUP,
    name: "fog base height",
    range: { max: 100, min: -50, step: 1 },
  }),
  createNumberVariable(fogUniforms.startDistance, "value", {
    group: LOOK_FOG_GROUP,
    name: "fog start distance",
    range: { max: 300, min: 0, step: 1 },
  }),
  createColourVariable(fogUniforms.color, { group: LOOK_FOG_GROUP, name: "fog colour" }),
];
