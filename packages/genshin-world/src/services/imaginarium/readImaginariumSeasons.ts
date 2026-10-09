import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { imaginariumSeasonSchema } from "#src/models/imaginarium/ImaginariumSeason";
import { z } from "zod";

// The Imaginarium Theater's seasons in the game's role combat schedule, the slice `pnpm -C scripts genshin:assets imaginarium`
// Writes, imported on demand and checked against its shape as it arrives
export const readImaginariumSeasons = async (): Promise<ImaginariumSeason[]> => {
  const { default: seasons } = await import("#src/generated/imaginarium/seasons.json");
  return z.array(imaginariumSeasonSchema).parse(seasons);
};
