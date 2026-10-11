import type { TerrainFeature } from "genshin-engine";

// A shape a feature is tried at on a residual grid: the samples its height is fitted to, as row and column shifts from
// The sample it is centred on, each with the share of the height its profile stands at there, the most samples any of
// Them lies from it, the samples between the centres it is tried on, and the feature it is at a centre in the world's
// Axes and a height
export interface TerrainFeatureShape<TFeature extends TerrainFeature> {
  createFeature: (x: number, z: number, height: number) => TFeature;
  offsets: [number, number, number][];
  reach: number;
  spacing: number;
}
