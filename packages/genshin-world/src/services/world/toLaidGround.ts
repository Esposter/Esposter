import type { LaidGround } from "#src/models/world/LaidGround";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { GroundPoint } from "genshin-engine";

import { getLaidGroundSquares } from "#src/services/world/getLaidGroundSquares";
import { parseGroundPieceKey } from "#src/services/world/parseGroundPieceKey";
import { NotFoundError } from "@esposter/shared";

// A ground laid over Windrise's with the domain its key names. A piece of an outlined area is the surface of that
// Area's outline, clipped to the squares its key's path names, and a plateau's key names no area, so it has none
export const toLaidGround = (
  key: string,
  ground: RegionGround,
  regions: readonly { areas: readonly { id: string; outline: readonly GroundPoint[] }[]; id: string }[],
): LaidGround => {
  const { area, path, region } = parseGroundPieceKey(key);
  if (area === undefined) return { ground };
  const outline = regions.find(({ id }) => id === region)?.areas.find(({ id }) => id === area)?.outline;
  if (!outline) throw new NotFoundError("GroundArea", key);
  return { domain: { outline, squares: path.length === 0 ? undefined : getLaidGroundSquares(outline, path) }, ground };
};
