import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { GroundPoint } from "genshin-engine";

import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { INTERACTIVE_MAP_MATCH_START_SCALE } from "#src/services/genshinAssets/points/constants";
import { getMedianPoint } from "#src/services/genshinAssets/points/getMedianPoint";

// A start turned as given, at the map's own unit, carrying the first set's median point onto the second's. The medians
// Are the points a few far-off ones of either set cannot pull, which a mean is
export const createStartTransform = (
  from: readonly GroundPoint[],
  to: readonly GroundPoint[],
  mirrored: boolean,
  turn: number,
): SimilarityTransform => {
  const base: SimilarityTransform = {
    mirrored,
    offset: { x: 0, z: 0 },
    scale: INTERACTIVE_MAP_MATCH_START_SCALE,
    turn,
  };
  const carried = applySimilarityTransform(base, getMedianPoint(from));
  const targetMedian = getMedianPoint(to);
  return { ...base, offset: { x: targetMedian.x - carried.x, z: targetMedian.z - carried.z } };
};
