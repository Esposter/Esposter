import type { TerrainFeatureShape } from "#src/models/genshinAssets/fit/TerrainFeatureShape";
import type { RidgeFeature, TerrainFeature } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// The lengths a segment is tried at, longest first, in metres
const SEGMENT_LENGTHS = [96, 48, 24];
// Candidate centres stand this share of a length apart
const CENTRE_SPACING_SHARE = 0.5;
// The angle between the headings a segment is tried at, as fine as a 24 metre segment can tell on a 6 metre grid
const HEADING_STEP = Math.PI / 8;

// The shapes a feature along a segment is tried at on a grid of the given step: a segment of each length, on centres
// Half its length apart, at every heading round the given turn in radians. Its band is the samples within the given
// Radius of its centre that the given profile stands above none at, by their distance across the segment's line,
// Positive to its left, and along it from its centre. Each shape's feature is the one the given function makes of the
// Segment's rounded ends, its length and its height
export const createSegmentShapes = <TFeature extends TerrainFeature>(
  step: number,
  turn: number,
  getBandRadius: (length: number) => number,
  getBandWeight: (across: number, along: number, length: number) => number,
  createFeature: (
    segment: Pick<RidgeFeature, "endX" | "endZ" | "startX" | "startZ">,
    length: number,
    height: number,
  ) => TFeature,
): TerrainFeatureShape<TFeature>[] =>
  SEGMENT_LENGTHS.flatMap((length) => {
    const halfLength = length / 2;
    const reach = Math.ceil(getBandRadius(length) / step);
    const spacing = Math.max(1, Math.round((CENTRE_SPACING_SHARE * length) / step));
    return Array.from({ length: Math.round(turn / HEADING_STEP) }, (_value, index) => {
      const directionX = Math.cos(index * HEADING_STEP);
      const directionZ = Math.sin(index * HEADING_STEP);
      const offsets: [number, number, number][] = [];
      for (let rowShift = -reach; rowShift <= reach; rowShift++)
        for (let columnShift = -reach; columnShift <= reach; columnShift++) {
          const offsetX = columnShift * step;
          const offsetZ = rowShift * step;
          const across = directionX * offsetZ - directionZ * offsetX;
          const along = offsetX * directionX + offsetZ * directionZ;
          const weight = getBandWeight(across, along, length);
          if (weight > 0) offsets.push([rowShift, columnShift, weight]);
        }
      return {
        createFeature: (x, z, height) =>
          createFeature(
            {
              endX: roundFitted(x + halfLength * directionX),
              endZ: roundFitted(z + halfLength * directionZ),
              startX: roundFitted(x - halfLength * directionX),
              startZ: roundFitted(z - halfLength * directionZ),
            },
            length,
            height,
          ),
        offsets,
        reach,
        spacing,
      };
    });
  });
