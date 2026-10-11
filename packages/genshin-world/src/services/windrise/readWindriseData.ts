import type { WindriseData } from "#src/models/windrise/WindriseData";

import { groundLayerFieldSchema } from "#src/models/windrise/groundLayerFieldSchema";
import { windriseOakSchema } from "#src/models/windrise/WindriseOak";
import { windrisePavingSchema } from "#src/models/windrise/WindrisePaving";
import { windrisePlantSchema } from "#src/models/windrise/WindrisePlant";
import { windriseStatueSchema } from "#src/models/windrise/WindriseStatue";
import { windriseSurfacesSchema } from "#src/models/windrise/WindriseSurfaces";
import { windriseWaterSchema } from "#src/models/windrise/WindriseWater";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { readGameData } from "#src/services/data/readGameData";
import { REGION_GROUND_KEYS } from "#src/services/world/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Windrise's records and the regions' grounds laid over its own, each fetched by its key from the hosted game data and
// Checked against its schema as it arrives. The plants are read as their record, whose plant names are unique
export const readWindriseData = async (gameDataBaseUrl: string): Promise<WindriseData> => {
  const [baseGround, groundLayers, oak, paving, plantsRecord, statue, surfaces, water, regionGrounds] =
    await Promise.all([
      readGameData(gameDataBaseUrl, "ground/windrise", regionGroundSchema),
      readGameData(gameDataBaseUrl, "windrise/ground-layers", groundLayerFieldSchema),
      readGameData(gameDataBaseUrl, "windrise/oak", windriseOakSchema),
      readGameData(gameDataBaseUrl, "windrise/paving", windrisePavingSchema),
      readGameData(
        gameDataBaseUrl,
        "windrise/plants",
        z.object({ plants: createUniqueArraySchema(windrisePlantSchema, "name") }),
      ),
      readGameData(gameDataBaseUrl, "windrise/statue", windriseStatueSchema),
      readGameData(gameDataBaseUrl, "windrise/surfaces", windriseSurfacesSchema),
      readGameData(gameDataBaseUrl, "windrise/water", windriseWaterSchema),
      Promise.all(REGION_GROUND_KEYS.map((key) => readGameData(gameDataBaseUrl, key, regionGroundSchema))),
    ]);
  return { baseGround, groundLayers, oak, paving, plants: plantsRecord.plants, regionGrounds, statue, surfaces, water };
};
