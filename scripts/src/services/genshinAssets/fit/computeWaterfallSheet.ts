import type { WaterfallSheetRecord } from "#src/models/genshinAssets/fit/WaterfallSheetRecord";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toPoint } from "#src/services/genshinAssets/fit/toPoint";
import { Vector3 } from "three";

// How far below its highest point a vertex may stand and still lie on the lip's edge, in metres.
// A centimetre, the precision every fitted number keeps.
const LIP_EDGE_TOLERANCE = 0.01;

// A waterfall's sheet is read off its mesh's points in the world's axes.
// The centre of its highest edge is the lip.
// The unit direction across that edge on the ground is turned to face +x or else +z.
// The edge's length is its width, and the mesh's height is its drop.
// A lip with no width has no direction across it, so it has no sheet.
export const computeWaterfallSheet = (points: Vector3[]): undefined | WaterfallSheetRecord => {
  const highest = Math.max(...points.map(({ y }) => y));
  const lowest = Math.min(...points.map(({ y }) => y));
  const lipPoints = points.filter(({ y }) => y >= highest - LIP_EDGE_TOLERANCE);
  let start = lipPoints[0] ?? new Vector3();
  let end = start;
  let edgeLength = 0;
  for (const first of lipPoints)
    for (const second of lipPoints) {
      const length = Math.hypot(second.x - first.x, second.z - first.z);
      if (length > edgeLength) {
        start = first;
        end = second;
        edgeLength = length;
      }
    }

  const width = roundFitted(edgeLength);
  if (width === 0) return undefined;

  const across = new Vector3(end.x - start.x, 0, end.z - start.z).normalize();
  const acrossX = roundFitted(across.x);
  if (acrossX < 0 || (acrossX === 0 && roundFitted(across.z) < 0)) across.negate();
  return {
    across: toPoint(across),
    drop: roundFitted(highest - lowest),
    lip: toPoint(new Vector3((start.x + end.x) / 2, highest, (start.z + end.z) / 2)),
    width,
  };
};
