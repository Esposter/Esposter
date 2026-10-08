import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StoneLight } from "genshin-engine";
import type { Matrix3 } from "three";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { computeStoneSampleColor } from "#src/services/genshinParity/witness/computeStoneSampleColor";
import { STONE_HEIGHT_BANDS } from "#src/services/genshinParity/witness/constants";
import { groupStoneBins } from "#src/services/genshinParity/witness/groupStoneBins";
import { toLab } from "#src/services/shared/toLab";
import { toXyz } from "#src/services/shared/toXyz";
import { toneMapGenshin } from "genshin-engine";
import { Vector3 } from "three";

// How far a stone light stands from a reference's stone as the screen shows it: over each bin a solve reads
// (`groupStoneBins`), the CIELab distance between the bin's mean colour as the reference shows it and as the light
// Casts it through the white balance and the tone curve (`computeStoneSampleColor`), weighed by the bin's pixels, over
// The whole stone and in each band of height (`STONE_HEIGHT_BANDS`, by its top). Over bins rather than bands of how
// Bright the reference shows, which pick out the pixels its own texels darken and leave ours, a pixel off, at the
// Frame's mean: banded so, the day title's stone read flat across bands the game spans from near black to near white
export const readStoneColourDistance = (
  samples: readonly StoneLightSample[],
  light: StoneLight,
  whiteBalance: Matrix3,
): { distance: number; heights: { count: number; distance: number; top: number }[] } => {
  const balanced = new Vector3();
  const heightDistanceMap = new Map<number, { count: number; sum: number }>();
  let count = 0;
  let sum = 0;
  for (const { displayColor, samples: binSamples } of groupStoneBins(samples, whiteBalance)) {
    const ours: Vector = [0, 0, 0];
    for (const sample of binSamples) {
      balanced.fromArray(computeStoneSampleColor(sample, light)).applyMatrix3(whiteBalance);
      const shown = toneMapGenshin([balanced.x, balanced.y, balanced.z]);
      for (const channel of CHANNELS) ours[channel] += shown[channel] / binSamples.length;
    }
    const [referenceLightness, referenceA, referenceB] = toLab(toXyz(displayColor));
    const [oursLightness, oursA, oursB] = toLab(toXyz(ours));
    const distance = Math.hypot(referenceLightness - oursLightness, referenceA - oursA, referenceB - oursB);
    const top = STONE_HEIGHT_BANDS.find((bandTop) => (binSamples[0]?.height ?? 0) < bandTop) ?? Infinity;
    const height = heightDistanceMap.get(top) ?? { count: 0, sum: 0 };
    height.count += binSamples.length;
    height.sum += distance * binSamples.length;
    heightDistanceMap.set(top, height);
    count += binSamples.length;
    sum += distance * binSamples.length;
  }
  return {
    distance: sum / Math.max(count, 1),
    heights: Array.from(heightDistanceMap, ([top, height]) => ({
      count: height.count,
      distance: height.sum / height.count,
      top,
    })).toSorted((firstHeight, secondHeight) => firstHeight.top - secondHeight.top),
  };
};
