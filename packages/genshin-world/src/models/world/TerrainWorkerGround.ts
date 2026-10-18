import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { GroundLayerField } from "genshin-engine";

// The records a terrain worker computes its tiles from, which the world read before it opened: Windrise's ground, the
// Field placing the ground's layers and the surfaces painting them, and the water no flower grows under
export interface TerrainWorkerGround {
  baseGrounds: [RegionGround, ...RegionGround[]];
  groundLayers: GroundLayerField;
  surfaces: WindriseSurfaces;
  waterLevel: number;
}
