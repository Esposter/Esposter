import { z } from "zod";

// The enemy kinds a bounty of one difficulty may hunt, each the monster the wiki's list names, and the difficulty by the
// Dump's own name for it. Provisional: a name the wiki names as a family resolves to one of its variants
export interface ReputationBountyTarget {
  difficulty: string;
  enemyKindIds: number[];
}

export const reputationBountyTargetSchema = z.object({
  difficulty: z.string().nonempty(),
  enemyKindIds: z.array(z.int().positive()).min(1),
}) satisfies z.ZodType<ReputationBountyTarget>;
