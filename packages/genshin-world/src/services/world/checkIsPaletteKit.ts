import type { BuildingKit } from "#src/models/world/BuildingKit";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { BuildingKitPaletteReaderMap } from "#src/services/world/BuildingKitPaletteReaderMap";

// Whether a kit has a palette record to read, which Snezhnaya's does not
export const checkIsPaletteKit = (buildingKit: BuildingKit): buildingKit is keyof RegionPaletteMap =>
  buildingKit in BuildingKitPaletteReaderMap;
