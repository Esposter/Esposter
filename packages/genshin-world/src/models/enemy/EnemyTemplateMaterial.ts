import { z } from "zod";

// A material a Drops template drops, by the game's item id and the tier it starts dropping at. The wiki gives a template's
// Materials by tier and no count for them, so none is held
export interface EnemyTemplateMaterial {
  itemId: number;
  tier: number;
}

export const enemyTemplateMaterialSchema = z.object({
  itemId: z.int().positive(),
  tier: z.int().nonnegative(),
}) satisfies z.ZodType<EnemyTemplateMaterial>;
