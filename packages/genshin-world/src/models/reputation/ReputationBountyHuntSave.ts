import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";

import { z } from "zod";

// The bounty the player has taken as the save holds it: the bounty, the region its target spawns in, the spawn point, the
// Kind of target drawn for it, and whether that target is defeated
export const reputationBountyHuntSaveSchema = z.object({
  bountyId: z.int().positive(),
  isTargetDefeated: z.boolean(),
  regionId: z.int().positive(),
  spawn: z.tuple([z.number(), z.number(), z.number()]),
  targetEnemyKindId: z.int().positive(),
}) satisfies z.ZodType<ReputationBountyHunt>;

export type ReputationBountyHuntSave = z.infer<typeof reputationBountyHuntSaveSchema>;
