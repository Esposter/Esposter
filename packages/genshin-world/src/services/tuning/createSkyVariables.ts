import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";
import type { DevVariable } from "#src/models/dev/DevVariable";

import { GAME_MINUTES_PER_SECOND_RANGE } from "#src/services/constants";
import { LOOK_SKY_GROUP, TUNING_UNIT_RANGE } from "#src/services/tuning/constants";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";
import { MINUTES_PER_DAY } from "genshin-engine";

export const createSkyVariables = ({
  gameClock,
  skyUniforms,
}: Pick<GenshinTuningOptions, "gameClock" | "skyUniforms">): DevVariable[] => [
  createNumberVariable(gameClock, "minutes", {
    group: LOOK_SKY_GROUP,
    name: "sky minutes",
    range: { max: MINUTES_PER_DAY, min: 0, step: 1 },
  }),
  // Zero holds the hour still, to compare it against a screenshot
  createNumberVariable(gameClock, "minutesPerSecond", {
    group: LOOK_SKY_GROUP,
    name: "sky minutes per second",
    range: { ...GAME_MINUTES_PER_SECOND_RANGE, step: 1 },
  }),
  createNumberVariable(skyUniforms.cloudCoverage, "value", {
    group: LOOK_SKY_GROUP,
    name: "cloud coverage",
    range: TUNING_UNIT_RANGE,
  }),
];
