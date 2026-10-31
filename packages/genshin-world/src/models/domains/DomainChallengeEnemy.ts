import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { z } from "zod";

// One enemy group of a challenge wave: its count and its name, and the enemy kind a boss wave names, which its camp
// Spawns in place of a stand-in
export interface DomainChallengeEnemy {
  count: number;
  enemyKindId?: EnemyKindId;
  name: string;
}

export const domainChallengeEnemySchema = z.object({
  count: z.int().positive(),
  enemyKindId: z.enum(EnemyKindId).optional(),
  name: z.string().min(1),
}) satisfies z.ZodType<DomainChallengeEnemy>;
