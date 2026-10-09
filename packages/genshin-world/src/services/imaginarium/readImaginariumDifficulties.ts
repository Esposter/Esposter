import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";

import { imaginariumDifficultySchema } from "#src/models/imaginarium/ImaginariumDifficulty";
import { z } from "zod";

// Every difficulty of the Imaginarium Theater in the game's role combat table, the slice `pnpm -C scripts genshin:assets
// Imaginarium` writes, imported on demand and checked against its shape as it arrives
export const readImaginariumDifficulties = async (): Promise<ImaginariumDifficulty[]> => {
  const { default: difficulties } = await import("#src/generated/imaginarium/difficulties.json");
  return z.array(imaginariumDifficultySchema).parse(difficulties);
};
