import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { z } from "zod";

// A transformative reaction's poise, as the enemies dataset publishes it: the poise its hit deals to the enemy it lands
// On and to each enemy it reaches, and whether that hit is blunt, so that it drains a Freeze and shatters what is left
export interface ReactionPoise {
  isBlunt: boolean;
  poiseDamage: number;
  reachPoiseDamage: number;
  reactionType: TransformativeReactionType;
}

export const reactionPoiseSchema = z.object({
  isBlunt: z.boolean(),
  poiseDamage: z.int().nonnegative(),
  reachPoiseDamage: z.int().nonnegative(),
  reactionType: z.enum(TransformativeReactionType) satisfies z.ZodType<TransformativeReactionType>,
}) satisfies z.ZodType<ReactionPoise>;
