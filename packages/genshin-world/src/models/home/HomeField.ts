import { z } from "zod";

// One garden field, by its furnishing's item id: the seeds it holds at once, one to a slot
export interface HomeField {
  fieldItemId: number;
  slotCount: number;
}

export const homeFieldSchema = z.object({
  fieldItemId: z.int().positive(),
  slotCount: z.int().positive(),
}) satisfies z.ZodType<HomeField>;
