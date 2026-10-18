import type { Reaction } from "#src/models/combat/Reaction";

// Whether a hit's reactions include one a passive names, a named element counting only when the reaction carries it
export const checkIsReactionNamed = (
  reactions: readonly Reaction[],
  namedReactions: readonly Pick<Reaction, "element" | "reactionType">[],
): boolean =>
  reactions.some((triggered) =>
    namedReactions.some(
      (named) =>
        named.reactionType === triggered.reactionType &&
        (named.element === undefined || named.element === triggered.element),
    ),
  );
