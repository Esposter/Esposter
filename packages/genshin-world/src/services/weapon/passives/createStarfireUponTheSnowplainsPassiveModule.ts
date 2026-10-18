import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { createStellarGlimmerBuffPassiveModule } from "#src/services/weapon/passives/createStellarGlimmerBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const STARFIRE_UPON_THE_SNOWPLAINS_SOURCE = "starfireUponTheSnowplains";

// Starfire Upon the Snowplains, Emberwell's passive at its rank: after its wielder causes a reaction, its ATK rises by the rank's
// Percentage for its seconds, and after a Stellar Glimmer reaction the wielder triggers, its Stellar Glimmer reaction DMG rises by
// The rank's percentage for its seconds, whether or not the wielder is on the field
export const createStarfireUponTheSnowplainsPassiveModule = (params: number[]): WeaponPassiveModule => {
  const reactionBuffPassiveModule = createReactionBuffPassiveModule([takeOne(params, 0), takeOne(params, 1), 0], {
    attribute: Attribute.AttackPercent,
    source: STARFIRE_UPON_THE_SNOWPLAINS_SOURCE,
  });
  const stellarBuffPassiveModule = createStellarGlimmerBuffPassiveModule([takeOne(params, 2), takeOne(params, 3)], {
    attribute: Attribute.StellarGlimmerReactionDamageBonus,
    source: STARFIRE_UPON_THE_SNOWPLAINS_SOURCE,
  });
  return {
    onKitEvent: (event, context, combatant) => {
      reactionBuffPassiveModule.onKitEvent?.(event, context, combatant);
      stellarBuffPassiveModule.onKitEvent?.(event, context, combatant);
    },
  };
};
