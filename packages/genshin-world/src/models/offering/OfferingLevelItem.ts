import { z } from "zod";

// One item an offering level takes off the held counts: the item, and how many of it the level takes
export interface OfferingLevelItem {
  itemCount: number;
  itemId: number;
}

export const offeringLevelItemSchema = z.object({
  itemCount: z.int().positive(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<OfferingLevelItem>;
