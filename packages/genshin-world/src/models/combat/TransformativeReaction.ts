import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// A reaction that deals damage of its own
export interface TransformativeReaction extends Reaction {
  reactionType: TransformativeReactionType;
}
