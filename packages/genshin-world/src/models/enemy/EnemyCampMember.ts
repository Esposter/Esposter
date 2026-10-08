import type { GroundPoint } from "genshin-engine";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// One enemy of a camp: its kind and level, where it spawns, and the points it walks between while idle, none for one
// That stands at its spawn
export interface EnemyCampMember {
  enemyKindId: EnemyKindId;
  id: string;
  level: number;
  patrol: GroundPoint[];
  position: GroundPoint;
}

export const enemyCampMemberSchema = z.object({
  enemyKindId: z.enum(EnemyKindId) satisfies z.ZodType<EnemyKindId>,
  id: z.string().min(1),
  level: z.int().min(1),
  patrol: z.array(groundPointSchema),
  position: groundPointSchema,
}) satisfies z.ZodType<EnemyCampMember>;
