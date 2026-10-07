import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Haze } from "#src/models/genshinParity/witness/Haze";
import type { StoneLightReading } from "#src/models/genshinParity/witness/StoneLightReading";

import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { computeFogOpacity } from "#src/services/genshinParity/sky/computeFogOpacity";
import { computeHazeResidual } from "#src/services/genshinParity/witness/computeHazeResidual";
import { readStoneLightReading } from "#src/services/genshinParity/witness/readStoneLightReading";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The simplex's steps over the haze's density's and its falloff's logarithms and its most opacity's log-odds, and how
// Many it takes
const HAZE_STEPS = [0.5, 0.5, 1];
const HAZE_ITERATION_COUNT = 120;
// A haze hiding all lies at infinite log-odds, so the simplex starts no nearer all than this
const MAX_START_OPACITY = 0.98;
const NO_HAZE: Haze = { density: 0, heightFalloff: 1, maxOpacity: 0 };
// A haze from the logarithms of its density and its falloff and its most opacity's log-odds, the simplex's
// Coordinates, so neither of the first falls under none and the last stays between none and all
const toHaze = ([density = 0, heightFalloff = 0, maxOpacity = 0]: readonly number[]): Haze => ({
  density: Math.exp(density),
  heightFalloff: Math.exp(heightFalloff),
  maxOpacity: 1 / (1 + Math.exp(-maxOpacity)),
});
const toLogOdds = (share: number): number => Math.log(share / (1 - share));
// What a haze leaves unexplained over every reading, each sample hidden by it as much as it integrates to along the
// Ray, each reading weighed alike
const computeReadingsResidual = (readings: readonly StoneLightReading[], haze: Haze): number => {
  let squared = 0;
  for (const { eye, fog, pixels, whiteBalance } of readings) {
    const hazeFog = { ...fog, ...haze };
    for (const { point, sample } of pixels) sample.opacity = computeFogOpacity(eye, point, hazeFog);
    squared +=
      computeHazeResidual(
        pixels.map(({ sample }) => sample),
        whiteBalance,
      ) ** 2;
  }
  return Math.sqrt(squared / Math.max(readings.length, 1));
};
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
