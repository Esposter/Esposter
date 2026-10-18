import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { addScorpionBlessingStack } from "#src/services/gcg/cards/scorpionBlessing";
import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { takeOne } from "@esposter/shared";

export const SCORPOCALYPSE_ID = 223_031;
const EREMITE_SCORCHING_LOREMASTER_ID = 2_303;
const BLAZING_STRIKE_SKILL_ID = 23_032;

// Scorpocalypse, Eremite Scorching Loremaster's Talent: it is equipped to her and uses Blazing Strike at once. While she holds
// It, the defeat Burning Assault makes is marked for a Pyro Scorpion card to the hand, and at each End Phase a Scorpion
// Blessing stack is generated
export const scorpocalypse: GcgCardModule = {
  ...createGcgTalentCard(EREMITE_SCORCHING_LOREMASTER_ID, BLAZING_STRIKE_SKILL_ID),
  onEndPhase: ({ duel, sideIndex }) => {
    addScorpionBlessingStack(takeOne(duel.sides, sideIndex));
    return undefined;
  },
  onOpposingDefeated: (_context, zoneCard) => {
    zoneCard.counter = 1;
  },
};
