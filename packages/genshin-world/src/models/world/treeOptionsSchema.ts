import type { TreeOptions } from "genshin-engine";

import { z } from "zod";

export const treeOptionsSchema = z.object({
  branchLength: z.number().positive(),
  cardSize: z.number().positive(),
  cardsPerCluster: z.int().positive(),
  clusterRadius: z.number().positive(),
  mainBranchCount: z.int().positive(),
  seed: z.int().nonnegative(),
  trunkHeight: z.number().positive(),
  trunkRadius: z.number().positive(),
}) satisfies z.ZodType<TreeOptions>;
