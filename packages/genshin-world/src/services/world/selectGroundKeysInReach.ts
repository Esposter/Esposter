import type { GroundPoint } from "genshin-engine";

import { REGION_REACH } from "#src/services/constants";
import { computeOutlineDistance } from "genshin-engine";

// The laid ground keys that come within reach of (x, z): a region's own record with any of its areas, and a piece with
// Its own area alone
export const selectGroundKeysInReach = <K extends string>(
  regions: readonly { areas: readonly { id: string; outline: readonly GroundPoint[] }[]; id: string }[],
  keys: readonly K[],
  x: number,
  z: number,
): K[] =>
  keys.filter((key) => {
    const [, region, area] = key.split("/");
    const areas = regions.find(({ id }) => id === region)?.areas ?? [];
    return areas.some(
      ({ id, outline }) => (area === undefined || id === area) && computeOutlineDistance(outline, x, z) <= REGION_REACH,
    );
  });
