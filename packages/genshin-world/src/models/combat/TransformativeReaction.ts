import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// A reaction that deals damage of its own, reaching the enemies within its type's radius unless it gives one of its own
export interface TransformativeReaction extends Reaction {
  reachRadius?: number;
  reactionType: TransformativeReactionType;
}
