import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { takeOne } from "@esposter/shared";

// Draws one card of a kind, picked at random from a side's draw pile, into its hand, and takes it out of the pile. A card
// Drawn with the hand full is discarded, as drawGcgCards does, and a pile with no card of the kind draws none. The filter,
// when given, narrows the candidates further, to a companion for instance
export const drawRandomGcgCard = (
  side: GcgSideState,
  kind: GcgCardKind,
  random: () => number,
  handCardLimit: number,
  filter: (card: GcgCard) => boolean = () => true,
): void => {
  const candidates = side.drawPile.filter((cardId) => {
    const card = side.cards.find(({ id }) => id === cardId);
    return card?.kind === kind && filter(card);
  });
  if (candidates.length === 0) return;
  const cardId = takeOne(candidates, Math.floor(random() * candidates.length));
  side.drawPile.splice(side.drawPile.indexOf(cardId), 1);
  if (side.hand.length < handCardLimit) side.hand.push(cardId);
};
