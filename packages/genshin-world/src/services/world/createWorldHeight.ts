import type { RegionGround } from "#src/models/world/RegionGround";

import { createTerrainShapeHeight } from "genshin-engine";

// The world's one ground: Windrise's, fitted to the game's terrain tiles round the oak's foot at the origin
// (`genshin:assets fit windrise`), with every region's ground laid over it. A region a fit has drawn stands on its own
// Base where its hills stand, and one no fit has drawn is raised where its places stand by its plateaus over the world's
// Base. Every region's hills and features are filed into the same cells as Windrise's, so a point reads only the few
// Near it
export const createWorldHeight = (
  baseGround: RegionGround,
  regionGrounds: readonly RegionGround[],
): ((x: number, z: number) => number) => createTerrainShapeHeight(baseGround, ...regionGrounds);
