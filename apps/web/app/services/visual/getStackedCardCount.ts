import type { CardStackGeometry } from "#src/models/visual/CardStackGeometry";

// The cards that stack behind the moving one, which is every other card up to the stack's depth
export const getStackedCardCount = ({
  cardCount,
  maxShownCards,
}: Pick<CardStackGeometry, "cardCount" | "maxShownCards">) => Math.min(maxShownCards, cardCount - 1);
