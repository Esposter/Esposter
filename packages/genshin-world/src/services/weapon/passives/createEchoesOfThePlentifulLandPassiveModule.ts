import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const JADE_FORGED_CROWN_SOURCE = "jadeForgedCrown";
// The Max HP each step of the passive's bonus counts, which its text gives as every thousand
const MAX_HEALTH_STEP = 1000;

// Echoes of the Plentiful Land at its rank: an Elemental Skill its wielder uses grants the Jade-Forged Crown, which raises
// Its Normal Attack DMG by the rank's share for each whole thousand of its Max HP, up to the rank's maximum, for the rank's
// Seconds
export const createEchoesOfThePlentifulLandPassiveModule = (params: number[]): WeaponPassiveModule => {
  const amountPerStep = takeOne(params, 0);
  const maximumAmount = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== combatant.characterId) return;
      const steps = Math.floor(combatant.attributes.maxHealth / MAX_HEALTH_STEP);
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: Math.min(steps * amountPerStep, maximumAmount),
        attribute: Attribute.NormalAttackDamageBonus,
        secondsRemaining: seconds,
        source: JADE_FORGED_CROWN_SOURCE,
      });
    },
  };
};
