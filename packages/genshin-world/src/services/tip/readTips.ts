import type { Tip } from "#src/models/tip/Tip";

import { tipSchema } from "#src/models/tip/Tip";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Every tutorial tip the game's tables hold, as `pnpm -C scripts genshin:assets tips` publishes them, checked as they arrive
export const readTips = (gameDataBaseUrl: string): Promise<Tip[]> =>
  readGameData(gameDataBaseUrl, "tips", z.array(tipSchema));
