import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";

export const sumWeights = (samples: readonly SurfaceSample[]): number =>
  samples.reduce((sum, { weight }) => sum + weight, 0);
