import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { createStellarGlimmerBuffPassiveModule } from "#src/services/weapon/passives/createStellarGlimmerBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const ECHO_OF_A_VOW_SOURCE = "echoOfAVow";

// Echo of a Vow, Echoes of the Heart's passive at its rank: after its wielder causes a reaction, its Elemental Mastery rises by the
// Rank's amount for its seconds, and after a Stellar Glimmer reaction the wielder triggers, its Stellar Glimmer reaction DMG rises by
// The rank's percentage for its seconds, whether or not the wielder is on the field
export const createEchoOfAVowPassiveModule = (params: number[]): WeaponPassiveModule => {
  const reactionBuffPassiveModule = createReactionBuffPassiveModule([takeOne(params, 0), takeOne(params, 2), 0], {
    attribute: Attribute.ElementalMastery,
    source: ECHO_OF_A_VOW_SOURCE,
  });
  const stellarBuffPassiveModule = createStellarGlimmerBuffPassiveModule([takeOne(params, 1), takeOne(params, 3)], {
    attribute: Attribute.StellarGlimmerReactionDamageBonus,
    source: ECHO_OF_A_VOW_SOURCE,
  });
  return {
    onKitEvent: (event, context, combatant) => {
      reactionBuffPassiveModule.onKitEvent?.(event, context, combatant);
      stellarBuffPassiveModule.onKitEvent?.(event, context, combatant);
    },
  };
};
