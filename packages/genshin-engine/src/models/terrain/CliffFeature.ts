import type { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";

// A cliff band along a segment: a terrace raised by its height up the side of the segment's line its left normal points
// To, out to its width across the line, blended in and out across its falloff, and faded past the segment's ends by it
export interface CliffFeature {
  endX: number;
  endZ: number;
  falloff: number;
  height: number;
  kind: TerrainFeatureKind.Cliff;
  startX: number;
  startZ: number;
  width: number;
}
