import type { RampOptions } from "#src/materials/RampOptions";

import { computeRampValues } from "#src/materials/computeRampValues";
import { DataTexture, LinearFilter, RedFormat } from "three";

// One row of red bytes the toon lighting reads its irradiance from, filtered linearly so the step stays smooth at
// Any resolution
export const createRampTexture = (rampOptions: RampOptions): DataTexture => {
  const rampValues = computeRampValues(rampOptions);
  const rampTexture = new DataTexture(rampValues, rampOptions.resolution, 1, RedFormat);
  rampTexture.magFilter = LinearFilter;
  rampTexture.minFilter = LinearFilter;
  rampTexture.needsUpdate = true;
  return rampTexture;
};
