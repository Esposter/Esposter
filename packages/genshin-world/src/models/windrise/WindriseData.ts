import type { WindriseOak } from "#src/models/windrise/WindriseOak";
import type { WindrisePaving } from "#src/models/windrise/WindrisePaving";
import type { WindrisePlant } from "#src/models/windrise/WindrisePlant";
import type { WindriseStatue } from "#src/models/windrise/WindriseStatue";
import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { WindriseWater } from "#src/models/windrise/WindriseWater";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { GroundLayerField } from "genshin-engine";

// Everything the Windrise records hold, Windrise's ground among them, with the regions' grounds the world lays over it
export interface WindriseData {
  baseGround: RegionGround;
  groundLayers: GroundLayerField;
  oak: WindriseOak;
  paving: WindrisePaving;
  plants: WindrisePlant[];
  regionGrounds: RegionGround[];
  statue: WindriseStatue;
  surfaces: WindriseSurfaces;
  water: WindriseWater;
}
