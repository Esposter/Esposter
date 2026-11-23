import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The most forge points a game day holds, which `pnpm -C scripts genshin:assets forging` publishes from the game's
// Constant Fetched by its key from the hosted game data and checked as it arrives
export const readForgeDailyPointCap = (gameDataBaseUrl: string): Promise<number> =>
  readGameData(gameDataBaseUrl, "forging/dailyPointCap", z.int().positive());
