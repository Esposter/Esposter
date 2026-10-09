import type { GcgSideState } from "#src/models/gcg/GcgSideState";

// Draws cards from the top of a side's draw pile into its hand. A card drawn with the hand full is discarded, and a
// Pile with no card left adds none
export const drawGcgCards = (side: GcgSideState, count: number, handCardLimit: number): void => {
  for (let drawn = 0; drawn < count; drawn++) {
    const cardId = side.drawPile.shift();
    if (cardId === undefined) return;
    else if (side.hand.length < handCardLimit) side.hand.push(cardId);
  }
};
