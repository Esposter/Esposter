import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { Matrix3 } from "three";

import { compareSampleUnderBlackShares } from "#src/services/genshinParity/display/compareSampleUnderBlackShares";
import { solveStoneLight } from "#src/services/genshinParity/witness/solveStoneLight";

// Each reference's stone samples under a white balance: the light solved under it over them (`solveStoneLight`), and
// The shares of them that light takes under the tone curve's black, channel by channel and in bands of how bright the
// Reference shows their green, beside the reference's own
export const readUnderBlackShares = (
  references: readonly (readonly StoneLightSample[])[],
  whiteBalance: Matrix3,
  bandCount = 1,
): { ours: Vector; reference: Vector }[][] =>
  references.map((samples) =>
    compareSampleUnderBlackShares(samples, solveStoneLight(samples, whiteBalance).light, whiteBalance, bandCount),
  );
