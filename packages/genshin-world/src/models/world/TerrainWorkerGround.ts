import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { GroundLayerField } from "genshin-engine";

// The records a terrain worker computes its tiles from, which the world read before it opened: Windrise's ground and each
// Region's laid over it, the field placing the ground's layers and the surfaces painting them, and the water no flower
// Grows under
export interface TerrainWorkerGround {
  baseGround: RegionGround;
  groundLayers: GroundLayerField;
  regionGrounds: RegionGround[];
  surfaces: WindriseSurfaces;
  waterLevel: number;
}
