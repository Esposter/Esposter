import type { DevVariable } from "#src/models/dev/DevVariable";
import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { TUNING_TINT_CHANNELS, TUNING_TINT_RANGE } from "#src/services/constants";
import { LOOK_GRADE_GROUP, TUNING_DOUBLE_UNIT_RANGE, TUNING_UNIT_RANGE } from "#src/services/tuning/constants";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";
import { computeGradeLut } from "genshin-engine";

export const createGradeVariables = ({
  gradeLutTexture,
  gradeOptions,
  postUniforms,
}: Pick<GenshinTuningOptions, "gradeLutTexture" | "gradeOptions" | "postUniforms">): DevVariable[] => {
  const grade = structuredClone(gradeOptions);
  const writeGrade = () => {
    const gradeValues = computeGradeLut(grade);
    gradeLutTexture.image.data?.set(gradeValues);
    gradeLutTexture.needsUpdate = true;
  };
  const tintRange = { max: TUNING_TINT_RANGE, min: -TUNING_TINT_RANGE, step: 0.001 };
  const tintVariables = TUNING_TINT_CHANNELS.flatMap(({ key, name }) => [
    createNumberVariable(grade.shadowTint, key, {
      group: LOOK_GRADE_GROUP,
      name: `grade shadow ${name}`,
      onChange: writeGrade,
      range: tintRange,
    }),
    createNumberVariable(grade.highlightTint, key, {
      group: LOOK_GRADE_GROUP,
      name: `grade highlight ${name}`,
      onChange: writeGrade,
      range: tintRange,
    }),
  ]);
  return [
    createNumberVariable(postUniforms.gradeIntensity, "value", {
      group: LOOK_GRADE_GROUP,
      name: "grade intensity",
      range: TUNING_UNIT_RANGE,
    }),
    createNumberVariable(grade, "contrast", {
      group: LOOK_GRADE_GROUP,
      name: "grade contrast",
      onChange: writeGrade,
      range: { max: 1.5, min: 0.5, step: 0.01 },
    }),
    createNumberVariable(grade, "saturation", {
      group: LOOK_GRADE_GROUP,
      name: "grade saturation",
      onChange: writeGrade,
      range: TUNING_DOUBLE_UNIT_RANGE,
    }),
    ...tintVariables,
  ];
};
