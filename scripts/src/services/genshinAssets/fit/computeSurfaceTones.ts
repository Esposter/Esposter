import type { FittedSurface } from "#src/models/genshinAssets/fit/FittedSurface";
import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { Vector } from "#src/models/shared/Vector";

import { clusterColours } from "#src/services/genshinAssets/fit/clusterColours";

// The most tones a surface's textures are split into, each a cluster of their colours
export const SURFACE_TONE_COUNT = 3;
// The most samples the palette's k-means reads: a clustering walks every sample at each of its steps, so a surface's
// Samples past this many are read at an even stride, each still weighted by its own area
const PALETTE_SAMPLE_LIMIT = 20000;

const toHex = (colour: Vector): string =>
  `#${colour.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
const computeTotalWeight = (samples: readonly SurfaceSample[]): number =>
  samples.reduce((sum, { weight }) => sum + weight, 0);
const computeWeightedMean = (samples: readonly SurfaceSample[]): Vector => {
  const total = computeTotalWeight(samples);
  return ([0, 1, 2] as const).map(
    (channel) => samples.reduce((sum, { colour, weight }) => sum + (colour[channel] ?? 0) * weight, 0) / total,
  ) as Vector;
};
// A surface's colour as the mean of its samples weighted by their area, and its palette: its samples grouped by k-means
// Over their colours (`clusterColours`, seeded darkest first), each tone the weighted mean of its samples with the share
// Of the weight its palette samples hold. Samples of no weight count for nothing, and the samples must hold some weight
export const computeSurfaceTones = (
  samples: readonly SurfaceSample[],
  count: number = SURFACE_TONE_COUNT,
): FittedSurface => {
  const weighted = samples.filter(({ weight }) => weight > 0);
  const stride = Math.max(1, Math.ceil(weighted.length / PALETTE_SAMPLE_LIMIT));
  const palette = weighted.filter((_sample, index) => index % stride === 0);
  const total = computeTotalWeight(palette);
  const clusters = clusterColours(
    palette.map(({ colour }) => colour),
    count,
  );
  return {
    color: toHex(computeWeightedMean(weighted)),
    palette: Array.from({ length: count }, (_tone, cluster) =>
      palette.filter((_sample, index) => clusters[index] === cluster),
    ).flatMap((members) =>
      members.length === 0
        ? []
        : [{ color: toHex(computeWeightedMean(members)), share: computeTotalWeight(members) / total }],
    ),
  };
};
