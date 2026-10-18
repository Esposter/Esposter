import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { electroInfusion } from "#src/services/gcg/cards/electroInfusion";
import { addGcgZoneCardToCharacter } from "#src/services/gcg/effects/addGcgZoneCardToCharacter";
import { takeOne } from "@esposter/shared";

const ELECTRO_INFUSION_ID = 114_032;
const LIGHTNING_STILETTO_ID = 114_031;
const STELLAR_RESTORATION_DAMAGE = 3;

// The character using the skill gains Electro Infusion
const grantElectroInfusion = (context: GcgEffectContext): void => {
  const { duel, sideIndex } = context;
  addGcgZoneCardToCharacter(context, takeOne(duel.sides, sideIndex).activeIndex, ELECTRO_INFUSION_ID, electroInfusion);
};

// Stellar Restoration, Keqing's elemental skill: 3 Electro DMG. Once the damage is dealt, a Lightning Stiletto is created in
// Hand if the hand has room (the wiki's Stellar Restoration (Character Card Skill)). With a Lightning Stiletto in hand, every
// Copy there is discarded instead and Keqing gains Electro Infusion, and no copy is created (the card's own text)
export const stellarRestoration: GcgSkillModule = {
  afterDamage: (context) => {
    const side = takeOne(context.duel.sides, context.sideIndex);
    if (side.hand.includes(LIGHTNING_STILETTO_ID)) {
      side.hand = side.hand.filter((cardId) => cardId !== LIGHTNING_STILETTO_ID);
      grantElectroInfusion(context);
    } else if (side.hand.length < context.duel.rule.handCardLimit) side.hand.push(LIGHTNING_STILETTO_ID);
  },
  getDamage: () => ({ damageType: Element.Electro, value: STELLAR_RESTORATION_DAMAGE }),
};

// The Stellar Restoration a Lightning Stiletto uses: the same damage, Keqing gains Electro Infusion, and no Lightning
// Stiletto is created
export const stellarRestorationFromCard: GcgSkillModule = {
  afterDamage: grantElectroInfusion,
  getDamage: () => ({ damageType: Element.Electro, value: STELLAR_RESTORATION_DAMAGE }),
};
