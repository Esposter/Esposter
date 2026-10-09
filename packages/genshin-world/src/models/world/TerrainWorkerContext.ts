import type { WindrisePlantsGround } from "#src/models/windrise/WindrisePlantsGround";
import type { TerrainTileOptions } from "genshin-engine";

// What a terrain worker computes its tiles with once its ground is loaded: the ground its tiles are raised by and its
// Flowers are scattered over, and the paint each vertex is coloured by
export interface TerrainWorkerContext {
  plantsGround: WindrisePlantsGround;
  writeColor: TerrainTileOptions["writeColor"];
}
