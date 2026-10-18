import { z } from "zod";

// One place a Shrine of Depths key is given: the quest whose reward names it, the key's item and the region it opens
// Shrines of. Each source stands on its own, so a key a quest and a statue both give is two sources
export interface ShrineKeySource {
  id: string;
  keyItemId: number;
  keyRegion: string;
  questId: number;
  rewardId: number;
}

export const shrineKeySourceSchema = z.object({
  id: z.string().min(1),
  keyItemId: z.int().positive(),
  keyRegion: z.string().min(1),
  questId: z.int().positive(),
  rewardId: z.int().positive(),
}) satisfies z.ZodType<ShrineKeySource>;
