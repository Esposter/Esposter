import type { LaidGround } from "#src/models/world/LaidGround";
import type { RegionGround } from "#src/models/world/RegionGround";

import { GROUND_BLEND_WIDTH } from "#src/services/world/constants";
import { createTerrainPiecesHeight } from "#src/services/world/createTerrainPiecesHeight";
import { createTerrainShapeHeight } from "genshin-engine/terrainWorker";

// The world's one ground: Windrise's, fitted to the game's terrain tiles round the oak's foot at the origin
// (`genshin:assets fit windrise`), as one record or as its quarters. Every plateau laid over it stands over the base as
// Its features do. A piece of a region's ground is the surface of its own outline, and stands alone inside it, blended
// Into the base and its neighbours across the outline's seam, so a piece's level never reaches the pieces beside it
export const createWorldHeight = (
  baseGrounds: readonly [RegionGround, ...RegionGround[]],
  laidGrounds: readonly LaidGround[],
): ((x: number, z: number) => number) => {
  const plateaus = laidGrounds.flatMap(({ domain, ground }) => (domain ? [] : [ground]));
  const pieces = laidGrounds.flatMap(({ domain, ground }) =>
    domain ? [{ domain, getHeight: createTerrainShapeHeight(ground) }] : [],
  );
  return createTerrainPiecesHeight(createTerrainShapeHeight(...baseGrounds, ...plateaus), pieces, GROUND_BLEND_WIDTH);
};
