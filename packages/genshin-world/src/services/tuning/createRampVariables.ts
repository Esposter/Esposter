import type { DevVariable } from "#src/models/dev/DevVariable";
import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { LOOK_RAMP_GROUP, TUNING_UNIT_RANGE } from "#src/services/tuning/constants";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";
import { computeRampValues } from "genshin-engine";

export const createRampVariables = ({
  rampOptions,
  rampTexture,
}: Pick<GenshinTuningOptions, "rampOptions" | "rampTexture">): DevVariable[] => {
  const ramp = structuredClone(rampOptions);
  const writeRamp = () => {
    const rampValues = computeRampValues(ramp);
    rampTexture.image.data?.set(rampValues);
    rampTexture.needsUpdate = true;
  };
  return [
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
  ];
};
