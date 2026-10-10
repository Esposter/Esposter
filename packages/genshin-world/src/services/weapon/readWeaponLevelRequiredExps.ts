import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";

import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The weapon levelling table `pnpm -C scripts genshin:assets stats` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readWeaponLevelRequiredExps = (gameDataBaseUrl: string): Promise<RarityRequiredExpsMap> =>
  readGameData(gameDataBaseUrl, "stats/weaponLevelRequiredExps", z.record(z.string(), z.array(z.int().positive())));
