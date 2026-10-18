import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { createStellarGlimmerBuffPassiveModule } from "#src/services/weapon/passives/createStellarGlimmerBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const REPENTANCE_AND_REDEMPTION_SOURCE = "repentanceAndRedemption";

// Repentance and Redemption, Blade of Atonement's passive at its rank: after its wielder triggers an Elemental Reaction, its
// Elemental Mastery rises by the rank's amount for the rank's seconds, and after a Stellar Glimmer reaction its ATK rises by
// The rank's percentage for the rank's seconds, whether or not the wielder is on the field
export const createRepentanceAndRedemptionPassiveModule = (params: number[]): WeaponPassiveModule => {
  const reactionBuffPassiveModule = createReactionBuffPassiveModule([takeOne(params, 0), takeOne(params, 1), 0], {
    attribute: Attribute.ElementalMastery,
    source: REPENTANCE_AND_REDEMPTION_SOURCE,
  });
  const stellarBuffPassiveModule = createStellarGlimmerBuffPassiveModule([takeOne(params, 2), takeOne(params, 3)], {
    attribute: Attribute.AttackPercent,
    source: REPENTANCE_AND_REDEMPTION_SOURCE,
  });
  return {
    onKitEvent: (event, context, combatant) => {
      reactionBuffPassiveModule.onKitEvent?.(event, context, combatant);
      stellarBuffPassiveModule.onKitEvent?.(event, context, combatant);
    },
  };
};
