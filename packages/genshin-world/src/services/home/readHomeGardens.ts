import type { HomeField } from "#src/models/home/HomeField";
import type { HomePlant } from "#src/models/home/HomePlant";

import { homeFieldSchema } from "#src/models/home/HomeField";
import { homePlantSchema } from "#src/models/home/HomePlant";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The garden's fields and plants `pnpm -C scripts genshin:assets home` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readHomeGardens = (gameDataBaseUrl: string): Promise<{ fields: HomeField[]; plants: HomePlant[] }> =>
  readGameData(
    gameDataBaseUrl,
    "home/gardens",
    z.object({ fields: z.array(homeFieldSchema), plants: z.array(homePlantSchema) }),
  );
