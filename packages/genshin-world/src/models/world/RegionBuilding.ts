import type { BuildingKitOptionsMap } from "#src/models/world/BuildingKitOptionsMap";

import { fontaineBuildingOptionsSchema } from "#src/models/fontaine/FontaineBuildingOptions";
import { inazumaBuildingOptionsSchema } from "#src/models/inazuma/InazumaBuildingOptions";
import { liyueBuildingOptionsSchema } from "#src/models/liyue/LiyueBuildingOptions";
import { mondstadtBuildingOptionsSchema } from "#src/models/mondstadt/MondstadtBuildingOptions";
import { dieselpunkOptionsSchema } from "#src/models/nod-krai/DieselpunkOptions";
import { hallOptionsSchema } from "#src/models/snezhnaya/HallOptions";
import { rainforestCityOptionsSchema } from "#src/models/sumeru/RainforestCityOptions";
import { BuildingKit } from "#src/models/world/BuildingKit";
import { buildingOptionsSchema } from "#src/models/world/buildingOptionsSchema";
import { z } from "zod";

// A building as its region's kit and the options that kit takes, one variant per kit
export type RegionBuilding = {
  [TBuildingKit in BuildingKit]: { kit: TBuildingKit; options: BuildingKitOptionsMap[TBuildingKit] };
}[BuildingKit];

export const regionBuildingSchema = z.discriminatedUnion("kit", [
  z.object({ kit: z.literal(BuildingKit.Fontaine), options: fontaineBuildingOptionsSchema }),
  z.object({ kit: z.literal(BuildingKit.Inazuma), options: inazumaBuildingOptionsSchema }),
  z.object({ kit: z.literal(BuildingKit.Liyue), options: liyueBuildingOptionsSchema }),
  z.object({ kit: z.literal(BuildingKit.Mondstadt), options: mondstadtBuildingOptionsSchema }),
  z.object({ kit: z.literal(BuildingKit.Natlan), options: buildingOptionsSchema }),
  z.object({ kit: z.literal(BuildingKit.NodKrai), options: dieselpunkOptionsSchema }),
  z.object({ kit: z.literal(BuildingKit.Snezhnaya), options: hallOptionsSchema }),
  z.object({ kit: z.literal(BuildingKit.Sumeru), options: rainforestCityOptionsSchema }),
]) satisfies z.ZodType<RegionBuilding>;
