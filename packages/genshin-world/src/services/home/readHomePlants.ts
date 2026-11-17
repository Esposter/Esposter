import type { HomePlant } from "#src/models/home/HomePlant";

import { homePlantSchema } from "#src/models/home/HomePlant";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The seeds a garden's fields grow, `pnpm -C scripts genshin:assets home` publishes, read from the gardens record its fields
// Share. Fetched by its key from the hosted game data and checked against their shape as they arrive
export const readHomePlants = async (gameDataBaseUrl: string): Promise<HomePlant[]> => {
  const garden = await readGameData(gameDataBaseUrl, "home/gardens", z.object({ plants: z.array(homePlantSchema) }));
  return garden.plants;
};
