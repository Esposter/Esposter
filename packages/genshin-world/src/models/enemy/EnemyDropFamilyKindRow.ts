import { z } from "zod";

// A kind's row of the enemies dataset: the drop family its article's first Drops Table names, which the kind's defeat drops
export interface EnemyDropFamilyKindRow {
  enemyKindId: number;
  family: string;
}

export const enemyDropFamilyKindRowSchema = z.object({
  enemyKindId: z.int().positive(),
  family: z.string().min(1),
}) satisfies z.ZodType<EnemyDropFamilyKindRow>;
