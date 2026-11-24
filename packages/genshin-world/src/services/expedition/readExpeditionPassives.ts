import type { ExpeditionPassive } from "#src/models/expedition/ExpeditionPassive";

import { expeditionPassiveSchema } from "#src/models/expedition/ExpeditionPassive";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The expedition talents are published by `pnpm -C scripts genshin:assets expeditions`.
// Each is fetched by its key from the hosted game data and checked against its shape as it arrives
export const readExpeditionPassives = (gameDataBaseUrl: string): Promise<ExpeditionPassive[]> =>
  readGameData(gameDataBaseUrl, "expeditions/passives", z.array(expeditionPassiveSchema));
