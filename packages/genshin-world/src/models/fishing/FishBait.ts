import { z } from "zod";

// A bait as the generated bait slice holds it: the item id it is held in the bag under, and the ids of the fish it draws,
// Each joined from the game's tables, so a cast with it draws only among those
export interface FishBait {
  fishIds: number[];
  id: number;
}

export const fishBaitSchema = z.object({
  fishIds: z.array(z.int().positive()),
  id: z.int().positive(),
}) satisfies z.ZodType<FishBait>;
