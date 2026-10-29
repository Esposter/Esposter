import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";
import type { DevVariable } from "#src/models/dev/DevVariable";
import type { PostPipeline } from "genshin-engine";
import type { Except } from "type-fest";

import { GAME_MINUTES_PER_SECOND_MAX, TUNING_TINT_CHANNELS, TUNING_TINT_RANGE } from "#src/services/constants";
import {
  LOOK_BLOOM_GROUP,
  LOOK_FOG_GROUP,
  LOOK_GOD_RAYS_GROUP,
  LOOK_GRADE_GROUP,
  LOOK_OUTLINE_GROUP,
  LOOK_RAMP_GROUP,
  LOOK_RIM_GROUP,
  LOOK_SKY_GROUP,
  LOOK_WATER_GROUP,
  LOOK_WIND_GROUP,
  TUNING_DOUBLE_UNIT_RANGE,
  TUNING_UNIT_RANGE,
} from "#src/services/tuning/constants";
import { createColourVariable } from "#src/services/tuning/createColourVariable";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";
import { computeGradeLut, computeRampValues, MINUTES_PER_DAY } from "genshin-engine";

// The look's every uniform as a development variable, in the panel's sections of it, so the hour, clouds, wind, ramp, rim,
// Outline, fog, water, grade, god rays and bloom are set against reference screenshots rather than guessed. A ramp or a
// Grade is written into its texture at once; nothing is saved, and a value that looks right is copied into the region's
// Constants
export const createLookVariables = (
  {
    fogUniforms,
    gameClock,
    gradeLutTexture,
    gradeOptions,
    lightUniforms,
    postUniforms,
    rampOptions,
    rampTexture,
    skyUniforms,
    waterUniforms,
    windUniforms,
  }: Except<GenshinTuningOptions, "devRegistry" | "getRenderer" | "isTemporalAntialiasingOn" | "postPipeline" | "sun">,
  { bloomNode, godraysNode }: Pick<PostPipeline, "bloomNode" | "godraysNode">,
): DevVariable[] => {
  const ramp = structuredClone(rampOptions);
  const grade = structuredClone(gradeOptions);
  const writeRamp = () => {
    const rampValues = computeRampValues(ramp);
    rampTexture.image.data?.set(rampValues);
    rampTexture.needsUpdate = true;
  };
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
  const godraysVariables: DevVariable[] = godraysNode
    ? [
        createNumberVariable(godraysNode.density, "value", {
          group: LOOK_GOD_RAYS_GROUP,
          name: "god rays density",
          range: TUNING_UNIT_RANGE,
        }),
        createNumberVariable(godraysNode.maxDensity, "value", {
          group: LOOK_GOD_RAYS_GROUP,
          name: "god rays max density",
          range: TUNING_UNIT_RANGE,
        }),
        createNumberVariable(godraysNode.distanceAttenuation, "value", {
          group: LOOK_GOD_RAYS_GROUP,
          name: "god rays distance attenuation",
          range: { max: 5, min: 0, step: 0.01 },
        }),
        createColourVariable(postUniforms.godraysColor, { group: LOOK_GOD_RAYS_GROUP, name: "god rays colour" }),
      ]
    : [];
  const bloomVariables: DevVariable[] = bloomNode
    ? [
        createNumberVariable(bloomNode.strength, "value", {
          group: LOOK_BLOOM_GROUP,
          name: "bloom strength",
          range: TUNING_DOUBLE_UNIT_RANGE,
        }),
        createNumberVariable(bloomNode.radius, "value", {
          group: LOOK_BLOOM_GROUP,
          name: "bloom radius",
          range: TUNING_UNIT_RANGE,
        }),
        createNumberVariable(bloomNode.threshold, "value", {
          group: LOOK_BLOOM_GROUP,
          name: "bloom threshold",
          range: TUNING_UNIT_RANGE,
        }),
      ]
    : [];

  return [
    createNumberVariable(gameClock, "minutes", {
      group: LOOK_SKY_GROUP,
      name: "sky minutes",
      range: { max: MINUTES_PER_DAY, min: 0, step: 1 },
    }),
    // Zero holds the hour still, to compare it against a screenshot
    createNumberVariable(gameClock, "minutesPerSecond", {
      group: LOOK_SKY_GROUP,
      name: "sky minutes per second",
      range: { max: GAME_MINUTES_PER_SECOND_MAX, min: 0, step: 1 },
    }),
    createNumberVariable(skyUniforms.cloudCoverage, "value", {
      group: LOOK_SKY_GROUP,
      name: "cloud coverage",
      range: TUNING_UNIT_RANGE,
    }),
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
    createNumberVariable(ramp, "terminator", {
      group: LOOK_RAMP_GROUP,
      name: "ramp terminator",
      onChange: writeRamp,
      range: TUNING_UNIT_RANGE,
    }),
    createNumberVariable(ramp, "softness", {
      group: LOOK_RAMP_GROUP,
      name: "ramp softness",
      onChange: writeRamp,
      range: { max: 0.5, min: 0.01, step: 0.01 },
    }),
    createNumberVariable(lightUniforms.rimStrength, "value", {
      group: LOOK_RIM_GROUP,
      name: "rim strength",
      range: TUNING_DOUBLE_UNIT_RANGE,
    }),
    createColourVariable(lightUniforms.rimColor, { group: LOOK_RIM_GROUP, name: "rim colour" }),
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
    ...godraysVariables,
    ...bloomVariables,
  ];
};
