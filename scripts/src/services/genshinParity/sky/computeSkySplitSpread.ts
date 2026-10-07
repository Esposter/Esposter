import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";
import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

import { compareSkyStatistics } from "#src/services/genshinParity/sky/compareSkyStatistics";
import { splitSkyMask } from "#src/services/genshinParity/sky/splitSkyMask";

// How far a sky's statistics stand apart between two halves of it, root mean square over chequerboards of each block
// Size given, each laid square and shifted by half a block (`splitSkyMask`): the spread one view of a sky holds from
// Another of the same sky, which a sky whose clouds stand elsewhere can be held within
export const computeSkySplitSpread = (
  readStatistics: (sky: Uint8Array) => SkyStatistics,
  sky: Uint8Array,
  width: number,
  blockSizes: readonly number[],
): SkyDistance => {
  const distances = blockSizes.flatMap((blockSize) =>
    [0, blockSize / 2].map((offset) => {
      const [first, second] = splitSkyMask(sky, width, blockSize, offset);
      return compareSkyStatistics(readStatistics(first), readStatistics(second));
    }),
  );
  const readRootMeanSquare = (key: keyof SkyDistance): number =>
    Math.sqrt(distances.reduce((sum, distance) => sum + distance[key] ** 2, 0) / Math.max(distances.length, 1));
  return {
    brightness: readRootMeanSquare("brightness"),
    colour: readRootMeanSquare("colour"),
    cover: readRootMeanSquare("cover"),
    edgeSharpness: readRootMeanSquare("edgeSharpness"),
    spread: readRootMeanSquare("spread"),
  };
};
