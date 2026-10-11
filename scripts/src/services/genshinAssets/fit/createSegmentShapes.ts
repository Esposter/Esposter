import type { TerrainFeatureShape } from "#src/models/genshinAssets/fit/TerrainFeatureShape";
import type { RidgeFeature, TerrainFeature } from "genshin-engine";

import { computeFeatureOffsets } from "#src/services/genshinAssets/fit/computeFeatureOffsets";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// The lengths a segment is tried at, longest first, in metres
const SEGMENT_LENGTHS = [96, 48, 24];
// Candidate centres stand this share of a length apart
const CENTRE_SPACING_SHARE = 0.5;
// The angle between the headings a segment is tried at, as fine as a 24 metre segment can tell on a 6 metre grid
const HEADING_STEP = Math.PI / 8;

// The shapes a feature along a segment is tried at on a grid of the given step: a segment of each length, on centres
// Half its length apart, at every heading round the given turn in radians. Its samples weigh what the feature draws
// There (`computeFeatureOffsets`). Each shape's feature is the one the given function makes of the segment's rounded
// Ends, its length and its height
export const createSegmentShapes = <TFeature extends TerrainFeature>(
  step: number,
  turn: number,
  createFeature: (
    segment: Pick<RidgeFeature, "endX" | "endZ" | "startX" | "startZ">,
    length: number,
    height: number,
  ) => TFeature,
): TerrainFeatureShape<TFeature>[] =>
  SEGMENT_LENGTHS.flatMap((length) => {
    const halfLength = length / 2;
    const spacing = Math.max(1, Math.round((CENTRE_SPACING_SHARE * length) / step));
    return Array.from({ length: Math.round(turn / HEADING_STEP) }, (_value, index) => {
      const directionX = Math.cos(index * HEADING_STEP);
      const directionZ = Math.sin(index * HEADING_STEP);
      const createShapeFeature = (x: number, z: number, height: number): TFeature =>
        createFeature(
          {
            endX: roundFitted(x + halfLength * directionX),
            endZ: roundFitted(z + halfLength * directionZ),
            startX: roundFitted(x - halfLength * directionX),
            startZ: roundFitted(z - halfLength * directionZ),
          },
          length,
          height,
        );
      return {
        createFeature: createShapeFeature,
        ...computeFeatureOffsets(createShapeFeature(0, 0, 1), step),
        spacing,
      };
    });
  });
