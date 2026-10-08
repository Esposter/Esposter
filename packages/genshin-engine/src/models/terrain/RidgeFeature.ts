import type { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";

// A ridge along a segment: a Gaussian profile of its height, its width the distance from the segment at which it stands
// At about three fifths of its height
export interface RidgeFeature {
  endX: number;
  endZ: number;
  height: number;
  kind: TerrainFeatureKind.Ridge;
  startX: number;
  startZ: number;
  width: number;
}
