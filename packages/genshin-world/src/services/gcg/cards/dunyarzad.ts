import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { drawRandomGcgCard } from "#src/services/gcg/effects/drawRandomGcgCard";
import { takeOne } from "@esposter/shared";

const DUNYARZAD_ID = 322_016;

// Dunyarzad, a companion: a companion costs one die less to play, once per Round, and after a companion is played, a random
// companion is drawn from the pile, once per match (the wiki's Dunyarzad (Support Card)). The draw is kept in the card's
// counter, not its usages, so Dunyarzad stays on the field once it is spent; the use is spent even when the pile holds no
// companion. The draw is the side's, not each copy's: once any copy has spent it, a second copy does not draw again. That
// is provisional, as the wiki gives the draw once per match and not for a second copy
export const dunyarzad: GcgCardModule = {
  initialCounter: 1,
  onCardPlayed: ({ duel, sideIndex }, playedCard, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (
      playedCard.isCompanion !== true ||
      side.supports.some(({ cardId, counter }) => cardId === DUNYARZAD_ID && counter <= 0)
    )
      return;
    zoneCard.counter -= 1;
    drawRandomGcgCard(
      side,
      GcgCardKind.Support,
      duel.random,
      duel.rule.handCardLimit,
      (card) => card.isCompanion === true,
    );
  },
  onCostPaid: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).usedCardIds.push(DUNYARZAD_ID);
  },
  reduceCost: ({ duel, sideIndex }, subject) =>
    subject.card?.isCompanion === true && !takeOne(duel.sides, sideIndex).usedCardIds.includes(DUNYARZAD_ID)
      ? { count: 1 }
      : undefined,
};
