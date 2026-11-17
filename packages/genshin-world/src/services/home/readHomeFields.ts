import type { HomeField } from "#src/models/home/HomeField";

import { homeFieldSchema } from "#src/models/home/HomeField";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The garden's fields `pnpm -C scripts genshin:assets home` publishes, read from the gardens record its plants share
// Fetched by its key from the hosted game data and checked against their shape as they arrive
export const readHomeFields = async (gameDataBaseUrl: string): Promise<HomeField[]> => {
  const garden = await readGameData(gameDataBaseUrl, "home/gardens", z.object({ fields: z.array(homeFieldSchema) }));
  return garden.fields;
};
