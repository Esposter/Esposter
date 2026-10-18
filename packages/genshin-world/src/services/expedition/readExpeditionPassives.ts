import type { ExpeditionPassive } from "#src/models/expedition/ExpeditionPassive";

import { expeditionPassiveSchema } from "#src/models/expedition/ExpeditionPassive";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The expedition talents `pnpm -C scripts genshin:assets expeditions` publishes, fetched by their key from the hosted game
// Data and checked against their shape as they arrive
export const readExpeditionPassives = (gameDataBaseUrl: string): Promise<ExpeditionPassive[]> =>
  readGameData(gameDataBaseUrl, "expeditions/passives", z.array(expeditionPassiveSchema));
