import { z } from "zod";

// One of a family's material sets: its material names and their counts, paired by position. A set the wiki gives a
// Fixed Count (Raw Meat for a Sumpter Beast) names it as a bare string and carries the `fixed` flag
export const matSetSchema = z.object({
  fixed: z.literal(1).optional(),
  names: z.union([z.string(), z.array(z.string())]),
  nums: z.union([z.string(), z.array(z.number())]),
});
export type MatSet = z.infer<typeof matSetSchema>;
