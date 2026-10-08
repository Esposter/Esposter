import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { z } from "zod";

// One star a chamber is cleared for: its kind and the mark it must be above, in seconds of the clock or percent of the
// Monolith's health. Each condition a chamber sets is one star, and a clear with none met still counts as cleared
export interface AbyssStarCondition {
  kind: AbyssStarConditionKind;
  threshold: number;
}

export const abyssStarConditionSchema = z.object({
  kind: z.enum(AbyssStarConditionKind),
  threshold: z.int().nonnegative(),
}) satisfies z.ZodType<AbyssStarCondition>;
