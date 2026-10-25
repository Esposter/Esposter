import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Haze } from "#src/models/genshinParity/witness/Haze";
import type { StoneLightReading } from "#src/models/genshinParity/witness/StoneLightReading";

import { computeReadingsResidual } from "#src/services/genshinParity/witness/computeReadingsResidual";
import { readStoneLightReading } from "#src/services/genshinParity/witness/readStoneLightReading";
import { toHaze } from "#src/services/genshinParity/witness/toHaze";
import { toLogOdds } from "#src/services/genshinParity/witness/toLogOdds";
import { minimizeNelderMead } from "#src/services/recreation/solve/minimizeNelderMead";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The simplex's steps over the haze's density's and its falloff's logarithms and its most opacity's log-odds, and how
// Many it takes
const HAZE_STEPS = [0.5, 0.5, 1];
const HAZE_ITERATION_COUNT = 120;
// A haze hiding all lies at infinite log-odds, so the simplex starts no nearer all than this
const MAX_START_OPACITY = 0.98;
const NO_HAZE: Haze = { density: 0, heightFalloff: 1, maxOpacity: 0 };

// An hour's haze over the stone, refined by the simplex from the scene's own on what it leaves unexplained of every
// Reference given (`computeHazeResidual`), the stone light left free so only how like-lit stone changes with distance
// And height reads the haze. Every reference is to be of one hour, whose scene draws one haze. Returns the haze with
// Its residual, beside the scene's own haze's and no haze's
export const solveReferenceHaze = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
): Promise<{ haze: Haze; noneResidual: number; residual: number; sceneResidual: number }> => {
  const readings: StoneLightReading[] = [];
  // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
  for (const referenceId of referenceIds) readings.push(await readStoneLightReading(referenceId, witness));
  const [firstReading] = readings;
  if (!firstReading) throw new InvalidOperationError(Operation.Read, "references", "none given");
  const { density, heightFalloff, maxOpacity } = firstReading.fog;
  const sceneHaze = { density, heightFalloff, maxOpacity };
  const { cost, point } = await minimizeNelderMead(
    (logs) => Promise.resolve(computeReadingsResidual(readings, toHaze(logs))),
    [Math.log(density), Math.log(heightFalloff), toLogOdds(Math.min(maxOpacity, MAX_START_OPACITY))],
    HAZE_STEPS,
    HAZE_ITERATION_COUNT,
  );
  return {
    haze: toHaze(point),
    noneResidual: computeReadingsResidual(readings, NO_HAZE),
    residual: cost,
    sceneResidual: computeReadingsResidual(readings, sceneHaze),
  };
};
