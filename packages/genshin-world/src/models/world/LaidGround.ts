import type { RegionGround } from "#src/models/world/RegionGround";
import type { TerrainPieceDomain } from "#src/models/world/TerrainPieceDomain";

// A region's ground laid over Windrise's: its record, and for a piece of an outlined area the domain it is the surface of.
// A plateau has none, and stands over the base as its features do
export interface LaidGround {
  domain?: TerrainPieceDomain | undefined;
  ground: RegionGround;
}
