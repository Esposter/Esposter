import type { RegionGround } from "#src/models/world/RegionGround";
import type { TerrainShape } from "genshin-engine";

import { createTerrainShapeHeight } from "genshin-engine";

// The world's one ground: Windrise's hills, fitted to the game's terrain tiles round the oak's foot at the origin
// (`genshin:assets fit windrise`), over the world's base, with every other region's ground raised where its places
// Stand. Each region's features are filed into the same cells, so a point reads only the few near it
export const createWorldHeight = (
  baseGround: TerrainShape,
  regionGrounds: readonly RegionGround[],
): ((x: number, z: number) => number) =>
  createTerrainShapeHeight({ ...baseGround, features: regionGrounds.flatMap(({ features }) => features) });
