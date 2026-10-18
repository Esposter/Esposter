import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { takeOne } from "@esposter/shared";

const LIGHTNING_STILETTO_ID = 114_031;
const STELLAR_RESTORATION_DAMAGE = 3;

// Stellar Restoration, Keqing's elemental skill: 3 Electro DMG, and a Lightning Stiletto is created in hand once the damage
// Is dealt, if the hand has room (the wiki's Stellar Restoration (Character Card Skill)). The Electro Infusion it grants
// Through the card and the discard of copies already in hand are not modelled
export const stellarRestoration: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.hand.length < duel.rule.handCardLimit) side.hand.push(LIGHTNING_STILETTO_ID);
  },
  getDamage: () => ({ damageType: Element.Electro, value: STELLAR_RESTORATION_DAMAGE }),
};

// The Stellar Restoration a Lightning Stiletto uses: the same damage, with no Lightning Stiletto created
export const stellarRestorationFromCard: GcgSkillModule = {
  getDamage: () => ({ damageType: Element.Electro, value: STELLAR_RESTORATION_DAMAGE }),
};
