import type { LandRows } from "#src/models/globeLandMask/LandRows";
import type { WorldFeature } from "#src/models/globeLandMask/WorldFeature";

import { GeometryType } from "#src/models/globeLandMask/GeometryType";
import { takeOne } from "@esposter/shared";

/**
 * A scanline fill: each row's centre latitude crosses every edge it spans, and between the sorted crossings of one
 * country the line is inside it (an even count of crossings, so a hole's edges close their own gap). A country is
 * filled on its own, and the spans of all of them are merged afterwards, so touching countries become one run
 */
export const rasterizeLandMask = (
  features: readonly WorldFeature[],
  cellsPerDegree: number,
): { cellsPerDegree: number; rows: LandRows } => {
  const width = 360 * cellsPerDegree;
  const height = 180 * cellsPerDegree;
  const spansByRow: [number, number][][] = Array.from({ length: height }, () => []);
  for (const { geometry } of features) {
    const polygons = geometry.type === GeometryType.Polygon ? [geometry.coordinates] : geometry.coordinates;
    for (const polygon of polygons) {
      const edges: [number, number, number, number][] = [];
      for (const ring of polygon)
        for (let i = 0; i < ring.length - 1; i++) {
          const [x1, y1] = takeOne(ring, i);
          const [x2, y2] = takeOne(ring, i + 1);
          if (y1 !== y2) edges.push([x1, y1, x2, y2]);
        }
      for (let row = 0; row < height; row++) {
        const y = 90 - (row + 0.5) / cellsPerDegree;
        const crossings: number[] = [];
        for (const [x1, y1, x2, y2] of edges)
          if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) crossings.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
        const sortedCrossings = crossings.toSorted((firstCrossing, secondCrossing) => firstCrossing - secondCrossing);
        for (let i = 0; i + 1 < sortedCrossings.length; i += 2) {
          const start = Math.max(0, Math.ceil((takeOne(sortedCrossings, i) + 180) * cellsPerDegree - 0.5));
          const end = Math.min(width, Math.ceil((takeOne(sortedCrossings, i + 1) + 180) * cellsPerDegree - 0.5));
          if (start < end) takeOne(spansByRow, row).push([start, end]);
        }
      }
    }
  }
  const rows: LandRows = spansByRow.map((spans) => {
    const merged: number[] = [];
    for (const [start, end] of spans.toSorted((firstSpan, secondSpan) => firstSpan[0] - secondSpan[0])) {
      const lastEnd = merged.at(-1);
      if (lastEnd !== undefined && start <= lastEnd) merged[merged.length - 1] = Math.max(lastEnd, end);
      else merged.push(start, end);
    }
    return merged;
  });
  return { cellsPerDegree, rows };
};
