import type { CardStackGeometry } from "#src/models/visual/CardStackGeometry";
import type { Except } from "type-fest";

import { getStackedCardCount } from "#src/services/visual/getStackedCardCount";

// The scale the card that has just moved settles at, which is the back card of the stack's own scale
export const getInactiveCardScaleY = ({
  cardCount,
  cardScaleYRatioLoss,
  maxShownCards,
}: Except<CardStackGeometry, "scale">) => {
  // Size is irrelevant with a single card.
  if (cardCount === 1) return "1";
  return `${1 - cardScaleYRatioLoss * (getStackedCardCount({ cardCount, maxShownCards }) - 1)}`;
};
