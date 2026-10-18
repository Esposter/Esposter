import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";

import { abyssBenedictionChoiceSchema } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Benediction lists of every chamber `pnpm -C scripts genshin:assets spiral-abyss` publishes, keyed by the chamber's level
// Id, each with its three lists as the level row gives them
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readAbyssBenedictionChoices = (
  gameDataBaseUrl: string,
): Promise<Record<string, AbyssBenedictionChoice[][]>> =>
  readGameData(
    gameDataBaseUrl,
    "spiralAbyss/benedictionChoices",
    z.record(z.string(), z.array(z.array(abyssBenedictionChoiceSchema)).length(3)),
  );
