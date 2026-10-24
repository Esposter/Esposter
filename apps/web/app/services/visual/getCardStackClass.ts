import type { CardStackState } from "@/models/visual/CardStackState";

import { CardStackClass } from "@/models/visual/CardStackClass";

// Four card classes:
// - Active: moving right -> left -> right.
// - Overflow: hidden behind the second-last card, no animation.
// - Inactive: was active, now the right-most card, animating to overflow (in some cases).
// - Normal: a right-stack card making its way to become active.
export const getCardStackClass = (
  cardId: number,
  { activeCardId, cardIds, inactiveCardId, maxShownCards }: CardStackState,
) => {
  const offset = cardIds.indexOf(cardId);
  if (cardId === activeCardId) return CardStackClass.Active;
  // In the initial state, set the last card as inactive.
  else if ((inactiveCardId === undefined && cardId === maxShownCards) || cardId === inactiveCardId)
    return CardStackClass.Inactive;
  else if (offset > maxShownCards - 2) return CardStackClass.Overflow;
  // An animation restarts only when its name changes, and a card moves one offset a step, so the name alternates
  // with the offset's parity while the offset's own values ride on the card (`getCardStyles`)
  else return `${CardStackClass.Normal} ${offset % 2 === 0 ? CardStackClass.NormalEven : CardStackClass.NormalOdd}`;
};
