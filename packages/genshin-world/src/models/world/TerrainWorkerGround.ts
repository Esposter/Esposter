import type { WindriseBaseGround } from "#src/models/windrise/WindriseBaseGround";
import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { GroundLayerField } from "genshin-engine";

// The records a terrain worker computes its tiles from, which the world read before it opened: the heights of
// Windrise's base and of each region's plateaus, the field placing the ground's layers and the surfaces painting them,
// And the water no flower grows under
export interface TerrainWorkerGround {
  baseGround: WindriseBaseGround;
  groundLayers: GroundLayerField;
  regionGrounds: RegionGround[];
  surfaces: WindriseSurfaces;
  waterLevel: number;
}
