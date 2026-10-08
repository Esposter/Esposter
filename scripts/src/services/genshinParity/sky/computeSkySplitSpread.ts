import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";
import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

import { compareSkyStatistics } from "#src/services/genshinParity/sky/compareSkyStatistics";
import { splitSkyMask } from "#src/services/genshinParity/sky/splitSkyMask";

// How far a sky's statistics stand apart between two halves of it, root mean square over chequerboards of each block
// Size given, each laid square and shifted by half a block (`splitSkyMask`): the spread one view of a sky holds from
// Another of the same sky, which a sky whose clouds stand elsewhere can be held within. The clouds' own statistics are
// Read only over splits whose halves both hold clouds, since a half without any reads its clouds as black and dull
export const computeSkySplitSpread = (
  readStatistics: (sky: Uint8Array) => SkyStatistics,
  sky: Uint8Array,
  width: number,
  blockSizes: readonly number[],
): SkyDistance => {
  const splits = blockSizes.flatMap((blockSize) =>
    [0, blockSize / 2].map((offset) => {
      const [firstSky, secondSky] = splitSkyMask(sky, width, blockSize, offset);
      const [first, second] = [readStatistics(firstSky), readStatistics(secondSky)];
      return {
        distance: compareSkyStatistics(first, second),
        isClouded: first.clouds.coverage > 0 && second.clouds.coverage > 0,
      };
    }),
  );
  const distances = splits.map(({ distance }) => distance);
  const cloudedDistances = splits.filter(({ isClouded }) => isClouded).map(({ distance }) => distance);
  const readRootMeanSquare = (key: keyof SkyDistance, readDistances: SkyDistance[]): number =>
    Math.sqrt(readDistances.reduce((sum, distance) => sum + distance[key] ** 2, 0) / Math.max(readDistances.length, 1));
  return {
    brightness: readRootMeanSquare("brightness", cloudedDistances),
    cloudColour: readRootMeanSquare("cloudColour", cloudedDistances),
    colour: readRootMeanSquare("colour", distances),
    cover: readRootMeanSquare("cover", distances),
    edgeSharpness: readRootMeanSquare("edgeSharpness", cloudedDistances),
    spread: readRootMeanSquare("spread", cloudedDistances),
  };
};
