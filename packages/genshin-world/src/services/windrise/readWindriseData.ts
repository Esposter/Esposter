import type { WindriseData } from "#src/models/windrise/WindriseData";

import { groundLayerFieldSchema } from "#src/models/windrise/groundLayerFieldSchema";
import { windriseOakSchema } from "#src/models/windrise/WindriseOak";
import { windrisePavingSchema } from "#src/models/windrise/WindrisePaving";
import { windrisePlantSchema } from "#src/models/windrise/WindrisePlant";
import { windriseStatueSchema } from "#src/models/windrise/WindriseStatue";
import { windriseSurfacesSchema } from "#src/models/windrise/WindriseSurfaces";
import { windriseWaterSchema } from "#src/models/windrise/WindriseWater";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameData } from "#src/services/data/readGameData";
import { readWindriseBaseGrounds } from "#src/services/windrise/readWindriseBaseGrounds";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Windrise's records, its ground among them, each fetched by its key from the hosted game data and checked against its
// Schema as it arrives. Its ground is its record or its quarters, as the lock holds them, and the regions' grounds laid
// Over Windrise's are read with each region as it comes within reach. The Plants are read as their record, whose plant
// Names are unique
export const readWindriseData = async (gameDataBaseUrl: string): Promise<WindriseData> => {
  const [baseGrounds, groundLayers, oak, paving, plantsRecord, statue, surfaces, water] = await Promise.all([
    readWindriseBaseGrounds(Object.keys(gameDataLock.objects), (key) =>
      readGameData(gameDataBaseUrl, key, regionGroundSchema),
    ),
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
  ]);
  return { baseGrounds, groundLayers, oak, paving, plants: plantsRecord.plants, statue, surfaces, water };
};
