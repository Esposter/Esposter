import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { abyssFloorSchema } from "#src/models/spiralAbyss/AbyssFloor";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Every floor of the Spiral Abyss `pnpm -C scripts genshin:assets spiral-abyss` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readAbyssFloors = (gameDataBaseUrl: string): Promise<AbyssFloor[]> =>
  readGameData(gameDataBaseUrl, "spiralAbyss/floors", z.array(abyssFloorSchema));
