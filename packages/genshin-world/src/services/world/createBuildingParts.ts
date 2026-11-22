import type { BuildingKit } from "#src/models/world/BuildingKit";
import type { BuildingKitOptionsMap } from "#src/models/world/BuildingKitOptionsMap";
import type { BuildingPart } from "#src/models/world/BuildingPart";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { BuildingKitPartsMap } from "#src/services/world/BuildingKitPartsMap";

// A building's parts from the kit its region names, indexed through the kit's own key so each kit takes its own options
export const createBuildingParts = <TBuildingKit extends BuildingKit>(
  building: { kit: TBuildingKit; options: BuildingKitOptionsMap[TBuildingKit] },
  regionPalettes: RegionPaletteMap,
): BuildingPart[] => BuildingKitPartsMap[building.kit](building.options, regionPalettes);
