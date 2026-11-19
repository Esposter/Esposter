import type { EnemyTemplateMaterial } from "#src/models/enemy/EnemyTemplateMaterial";

import { enemyTemplateMaterialSchema } from "#src/models/enemy/EnemyTemplateMaterial";
import { z } from "zod";

// Where a kind's defeat takes its drops from, as its wiki article names it: a drop family's table, the materials of a
// Drops template, a boss's reward, which its blossom gives and its defeat does not drop, or none, for a kind whose
// Article names no drop family, template or reward
export type EnemyDropSource =
  | { materials: EnemyTemplateMaterial[]; type: "template" }
  | { type: "bossReward" }
  | { type: "family" }
  | { type: "none" };

export const enemyDropSourceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bossReward") }),
  z.object({ materials: z.array(enemyTemplateMaterialSchema), type: z.literal("template") }),
  z.object({ type: z.literal("family") }),
  z.object({ type: z.literal("none") }),
]) satisfies z.ZodType<EnemyDropSource>;
