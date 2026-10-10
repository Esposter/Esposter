import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";

import { homeBlueprintSchema } from "#src/models/home/HomeBlueprint";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The furnishings Tubby makes `pnpm -C scripts genshin:assets home` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readHomeBlueprints = (gameDataBaseUrl: string): Promise<HomeBlueprint[]> =>
  readGameData(gameDataBaseUrl, "home/blueprints", z.array(homeBlueprintSchema));
