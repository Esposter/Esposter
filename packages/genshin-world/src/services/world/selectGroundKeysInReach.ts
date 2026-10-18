import type { GroundPoint } from "genshin-engine";

import { checkIsOutlineInReach } from "#src/services/world/checkIsOutlineInReach";

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
    return areas.some(({ id, outline }) => (area === undefined || id === area) && checkIsOutlineInReach(outline, x, z));
  });
