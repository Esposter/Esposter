import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";

import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";
import { createGroundToneClassifier } from "#src/services/genshinAssets/fit/createGroundToneClassifier";
import { WINDRISE_GROUND_LAYER_TONES } from "#src/services/genshinAssets/shared/constants";

// Each base-map texel is classed to the tone nearest to it in Lab, and each layer's colour is the area-weighted mean of
// The texels classed into it, as hex
export const computeGroundLayerColours = (
  samples: readonly SurfaceSample[],
  tones: Record<string, string> = WINDRISE_GROUND_LAYER_TONES,
): Record<string, string> => {
  const classify = createGroundToneClassifier(tones);
  const classes = Object.groupBy(samples, ({ colour }) => classify(colour));
  return Object.fromEntries(
    Object.entries(classes).flatMap(([layer, members]) =>
      members === undefined ? [] : [[layer, computeSurfaceTones(members, 1).color]],
    ),
  );
};
