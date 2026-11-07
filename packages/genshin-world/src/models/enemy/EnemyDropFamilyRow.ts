import type { EnemyDropTable } from "#src/models/enemy/EnemyDropTable";

import { enemyMaterialDropSchema } from "#src/models/enemy/EnemyMaterialDrop";
import { z } from "zod";

// A drop family's row of the enemies dataset: the key its kinds name it by, which is the Drops Table type the wiki gives
// Them, and the drop table its enemies share
export interface EnemyDropFamilyRow extends EnemyDropTable {
  family: string;
}

export const enemyDropFamilyRowSchema = z.object({
  family: z.string().min(1),
  materials: z.array(enemyMaterialDropSchema),
  mora: z.number().nonnegative(),
}) satisfies z.ZodType<EnemyDropFamilyRow>;
