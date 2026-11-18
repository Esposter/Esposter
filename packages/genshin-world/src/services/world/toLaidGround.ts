import type { LaidGround } from "#src/models/world/LaidGround";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { GroundPoint } from "genshin-engine";

import { getLaidGroundSquares } from "#src/services/world/getLaidGroundSquares";
import { NotFoundError } from "@esposter/shared";

// A ground laid over Windrise's with the domain its key names. A piece of an outlined area is the surface of that area's
// Outline, clipped to the squares its key's indices name, and a plateau's key names no area, so it has none
export const toLaidGround = (
  key: string,
  ground: RegionGround,
  regions: readonly { areas: readonly { id: string; outline: readonly GroundPoint[] }[]; id: string }[],
): LaidGround => {
  const [, region, areaId, indices] = key.split("/");
  if (areaId === undefined) return { ground };
  const outline = regions.find(({ id }) => id === region)?.areas.find(({ id }) => id === areaId)?.outline;
  if (!outline) throw new NotFoundError("GroundArea", key);
  return {
    domain: { outline, squares: indices === undefined ? undefined : getLaidGroundSquares(outline, indices) },
    ground,
  };
};
