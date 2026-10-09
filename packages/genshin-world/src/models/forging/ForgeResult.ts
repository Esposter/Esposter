import { z } from "zod";

// One item a unit of a recipe yields, its count and its weight among the recipe's results. A recipe with one result yields
// It every unit; one with several draws one of them for each unit, each in proportion to its weight
export interface ForgeResult {
  count: number;
  itemId: number;
  weight: number;
}

export const forgeResultSchema = z.object({
  count: z.int().positive(),
  itemId: z.int().positive(),
  weight: z.int().positive(),
}) satisfies z.ZodType<ForgeResult>;
