import type { Reaction } from "#src/models/combat/Reaction";
import { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";

// Whether a reaction is one of a set's, or the Swirl or Crystallize that carries the element it is related to
export const involvesElement =
  (reactionTypes: ReadonlySet<ReactionType>, element?: Element) =>
  (reaction: Reaction): boolean =>
    reactionTypes.has(reaction.reactionType) ||
    (element !== undefined &&
      (reaction.reactionType === ReactionType.Swirl || reaction.reactionType === ReactionType.Crystallize) &&
      reaction.element === element);
