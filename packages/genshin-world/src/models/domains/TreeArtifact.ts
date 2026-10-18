import { z } from "zod";

// An artifact a Petrified Tree claim may grant at one rarity: the count it always grants, and the chance, as a fraction, of
// One more. Each artifact drawn is rolled from its rarity's data, the one `rollArtifact` takes
export interface TreeArtifact {
  chance: number;
  guaranteedCount: number;
  rarity: number;
}

export const treeArtifactSchema = z.object({
  chance: z.number().min(0).max(1),
  guaranteedCount: z.int().nonnegative(),
  rarity: z.int().positive(),
}) satisfies z.ZodType<TreeArtifact>;
