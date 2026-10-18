import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { drawRandomGcgCard } from "#src/services/gcg/effects/drawRandomGcgCard";
import { takeOne } from "@esposter/shared";

const TIMAEUS_ID = 322_003;
const ARTIFACTS_IN_DECK_TO_DRAW = 6;

const sumGcgCostCounts = (costs: GcgCost[]): number => costs.reduce((total, cost) => total + cost.count, 0);

const countGcgDeckArtifacts = (side: GcgSideState): number =>
  side.deckCardIds.filter((cardId) => side.cards.find((card) => card.id === cardId)?.kind === GcgCardKind.Artifact)
    .length;

// Timaeus: it comes with two Transmutation Materials and gains one at each End Phase. When played, with at least six Artifact
// Cards in the deck it was built with, it draws one Artifact Card at random from the rest of the deck. Once per Round, when an
// Artifact Card is played, it spends materials equal to the Artifact's total cost, and that Artifact is equipped for free
export const timaeus: GcgCardModule = {
  initialCounter: 2,
  onCostPaid: ({ duel, sideIndex }, subject, zoneCard) => {
    takeOne(duel.sides, sideIndex).usedCardIds.push(TIMAEUS_ID);
    zoneCard.counter -= sumGcgCostCounts(subject.card?.costs ?? []);
  },
  onEndPhase: (_context, zoneCard) => {
    zoneCard.counter += 1;
    return undefined;
  },
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (countGcgDeckArtifacts(side) < ARTIFACTS_IN_DECK_TO_DRAW) return;
    drawRandomGcgCard(side, GcgCardKind.Artifact, duel.random, duel.rule.handCardLimit);
  },
  reduceCost: ({ duel, sideIndex }, subject, zoneCard) => {
    if (subject.card?.kind !== GcgCardKind.Artifact) return undefined;
    if (takeOne(duel.sides, sideIndex).usedCardIds.includes(TIMAEUS_ID)) return undefined;
    if (zoneCard.counter < sumGcgCostCounts(subject.card.costs)) return undefined;
    return { count: sumGcgCostCounts(subject.costs) };
  },
};
