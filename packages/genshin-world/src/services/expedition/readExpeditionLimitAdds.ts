import type { ExpeditionLimitAdd } from "#src/models/expedition/ExpeditionLimitAdd";

import { expeditionLimitAddSchema } from "#src/models/expedition/ExpeditionLimitAdd";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Adventure Ranks that raise the expedition limit `pnpm -C scripts genshin:assets expeditions` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readExpeditionLimitAdds = (gameDataBaseUrl: string): Promise<ExpeditionLimitAdd[]> =>
  readGameData(gameDataBaseUrl, "expeditions/limits", z.array(expeditionLimitAddSchema));
