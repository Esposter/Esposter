import type { TerrainFeature } from "genshin-engine";

// A shape a feature is tried at on a residual grid: the samples its height is the mean of, as row and column shifts
// From the sample it is centred on, the most samples any of them lies from it, the samples between the centres it is
// Tried on, and the feature it is at a centre in the world's axes and a height
export interface TerrainFeatureShape<TFeature extends TerrainFeature> {
  createFeature: (x: number, z: number, height: number) => TFeature;
  offsets: [number, number][];
  reach: number;
  spacing: number;
}
