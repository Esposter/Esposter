import type { RegionGround } from "#src/models/world/RegionGround";

import { createTerrainShapeHeight } from "genshin-engine/terrainWorker";

// The world's one ground: Windrise's, fitted to the game's terrain tiles round the oak's foot at the origin
// (`genshin:assets fit windrise`), as one record or as its quarters, with every region's ground laid over it. The first
// Base is the one the others are lifted over, so each quarter after it stands over it as a region's piece does. A region
// A fit has drawn stands on its own base where its hills stand, and one no fit has drawn is raised where its places stand
// By its plateaus over the world's base. Every region's hills and features are filed into the same cells as Windrise's,
// So a point reads only the few near it
export const createWorldHeight = (
  baseGrounds: readonly [RegionGround, ...RegionGround[]],
  regionGrounds: readonly RegionGround[],
): ((x: number, z: number) => number) => createTerrainShapeHeight(...baseGrounds, ...regionGrounds);
