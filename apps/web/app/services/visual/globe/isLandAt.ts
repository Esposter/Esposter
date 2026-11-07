import type { LandMask } from "@/models/visual/LandMask";

import { takeOne } from "@esposter/shared";

// A longitude wraps round the antimeridian and a latitude settles on its pole's own row
export const isLandAt = ({ cellsPerDegree, rows }: LandMask, lat: number, lng: number) => {
  const width = 360 * cellsPerDegree;
  const row = Math.min(rows.length - 1, Math.max(0, Math.floor((90 - lat) * cellsPerDegree)));
  const column = ((Math.floor((lng + 180) * cellsPerDegree) % width) + width) % width;
  const runs = rows[row] ?? [];
  for (let i = 0; i < runs.length; i += 2) if (column >= takeOne(runs, i) && column < takeOne(runs, i + 1)) return true;
  return false;
};
