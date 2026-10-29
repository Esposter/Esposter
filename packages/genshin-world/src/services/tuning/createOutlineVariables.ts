import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";
import type { DevVariable } from "#src/models/dev/DevVariable";

import { LOOK_OUTLINE_GROUP } from "#src/services/tuning/constants";
import { createColourVariable } from "#src/services/tuning/createColourVariable";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";

export const createOutlineVariables = ({ postUniforms }: Pick<GenshinTuningOptions, "postUniforms">): DevVariable[] => [
  createNumberVariable(postUniforms.outlineThickness, "value", {
    group: LOOK_OUTLINE_GROUP,
    name: "outline thickness",
    range: { max: 0.01, min: 0, step: 0.0001 },
  }),
  createNumberVariable(postUniforms.outlineFadeDistance, "value", {
    group: LOOK_OUTLINE_GROUP,
    name: "outline fade distance",
    range: { max: 200, min: 1, step: 1 },
  }),
  createColourVariable(postUniforms.outlineColor, { group: LOOK_OUTLINE_GROUP, name: "outline colour" }),
];
