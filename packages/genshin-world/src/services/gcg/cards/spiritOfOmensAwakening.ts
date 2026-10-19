import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { addPyroScorpionToHand } from "#src/services/gcg/cards/addPyroScorpionToHand";
import { SPIRIT_OF_OMENS_AWAKENING_ID } from "#src/services/gcg/cards/constants";
import { takeOne } from "@esposter/shared";

const SPIRIT_OF_OMENS_AWAKENING_DAMAGE = 3;

// Spirit of Omen's Awakening: Pyro Scorpion, Eremite Scorching Loremaster's Elemental Burst: 3 Pyro DMG, and once each Match,
// A Pyro Scorpion card to the hand
export const spiritOfOmensAwakening: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedMatchIds?.includes(SPIRIT_OF_OMENS_AWAKENING_ID)) return;
    side.usedMatchIds = [...(side.usedMatchIds ?? []), SPIRIT_OF_OMENS_AWAKENING_ID];
    addPyroScorpionToHand(duel, sideIndex);
  },
  getDamage: () => ({ damageType: Element.Pyro, value: SPIRIT_OF_OMENS_AWAKENING_DAMAGE }),
};
