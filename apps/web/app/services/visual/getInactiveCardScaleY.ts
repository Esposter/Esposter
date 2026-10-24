import type { CardStackGeometry } from "@/models/visual/CardStackGeometry";

// The scale the card that has just moved settles at, which is the back card of the stack's own scale
export const getInactiveCardScaleY = ({
  cardCount,
  cardScaleYRatioLoss,
  maxShownCards,
}: Omit<CardStackGeometry, "scale">) => {
  // Size is irrelevant with a single card.
  if (cardCount === 1) return "1";
  return `${1 - cardScaleYRatioLoss * (Math.min(maxShownCards, cardCount - 1) - 1)}`;
};
