import type { Element } from "#src/models/Element";
import type { Reaction } from "#src/models/combat/Reaction";
import type { ReactionType } from "#src/models/combat/ReactionType";

// Whether a hit's reactions include one a passive names, a named element counting only when the reaction carries it
export const checkIsReactionNamed = (
  reactions: readonly Reaction[],
  namedReactions: readonly { element?: Element; reactionType: ReactionType }[],
): boolean =>
  reactions.some((triggered) =>
    namedReactions.some(
      (named) =>
        named.reactionType === triggered.reactionType &&
        (named.element === undefined || named.element === triggered.element),
    ),
  );
