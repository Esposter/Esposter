import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { DendroCoreKind } from "#src/models/kit/DendroCoreKind";

// A reaction that deals damage of its own, reaching the enemies within its type's radius, unless it gives one of its
// Own. A Dendro Core's burst names the kind of core it bursts from, which the team's party reaction hooks read
export interface TransformativeReaction extends Reaction {
  coreKind?: DendroCoreKind;
  reachRadius?: number;
  reactionType: TransformativeReactionType;
}
