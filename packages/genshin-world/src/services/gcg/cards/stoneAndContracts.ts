import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const STONE_AND_CONTRACTS_ID = 331_802;
const STONE_AND_CONTRACTS_OMNI_DICE = 3;

// Stone and Contracts, an event: when the next Round's Action Phase begins, 3 Omni dice are created and a card is drawn. The
// event waits on its side's onstages until then, and is spent by that Action Phase (the wiki's Stone and Contracts)
export const stoneAndContracts: GcgCardModule = {
  initialUsages: 1,
  onActionPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    createGcgDice(side, GcgDieFace.Omni, STONE_AND_CONTRACTS_OMNI_DICE);
    drawGcgCards(side, 1, duel.rule.handCardLimit);
    zoneCard.usages -= 1;
  },
  play: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(STONE_AND_CONTRACTS_ID, stoneAndContracts));
  },
};
