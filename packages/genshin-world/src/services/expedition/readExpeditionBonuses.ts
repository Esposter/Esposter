import type { ExpeditionBonus } from "#src/models/expedition/ExpeditionBonus";

import { expeditionBonusSchema } from "#src/models/expedition/ExpeditionBonus";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The expedition bonus's chance by level that the game's table gives, fetched by its key from the hosted game data and
// Checked against its shape as it arrives
export const readExpeditionBonuses = (gameDataBaseUrl: string): Promise<ExpeditionBonus[]> =>
  readGameData(gameDataBaseUrl, "expeditions/bonuses", z.array(expeditionBonusSchema));
