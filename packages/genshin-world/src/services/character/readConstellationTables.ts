import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";

import { characterConstellationKitSchema } from "#src/models/character/CharacterConstellationKit";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The constellation table `pnpm -C scripts genshin:assets stats` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readConstellationTables = (gameDataBaseUrl: string): Promise<CharacterConstellationKit[]> =>
  readGameData(gameDataBaseUrl, "stats/characterConstellationKits", z.array(characterConstellationKitSchema));
