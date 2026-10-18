import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// A reaction that deals damage of its own, reaching the enemies within its type's radius, unless it gives one of its
// Own, and adding to its damage the bonus the team's kits give it, on top of the one its creator's kit gives
export interface TransformativeReaction extends Reaction {
  reachRadius?: number;
  reactionBonus?: number;
  reactionType: TransformativeReactionType;
}
