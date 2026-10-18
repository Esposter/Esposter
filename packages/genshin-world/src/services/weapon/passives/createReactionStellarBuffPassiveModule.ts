import type { Attribute } from "#src/models/character/Attribute";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { createStellarGlimmerBuffPassiveModule } from "#src/services/weapon/passives/createStellarGlimmerBuffPassiveModule";

// A passive with a reaction clause and a Stellar Glimmer clause, each raising one attribute by its amount for its seconds: the
// Reaction one after its wielder causes an Elemental Reaction, the Stellar Glimmer one after a Stellar Glimmer reaction it
// Triggers, whether or not the wielder is on the field. Neither clause takes an Ascendant Gleam amount
export const createReactionStellarBuffPassiveModule = ({
  reactionAmount,
  reactionAttribute,
  reactionSeconds,
  source,
  stellarAmount,
  stellarAttribute,
  stellarSeconds,
}: {
  reactionAmount: number;
  reactionAttribute: Attribute;
  reactionSeconds: number;
  source: string;
  stellarAmount: number;
  stellarAttribute: Attribute;
  stellarSeconds: number;
}): WeaponPassiveModule => {
  const reactionBuffPassiveModule = createReactionBuffPassiveModule([reactionAmount, reactionSeconds, 0], {
    attribute: reactionAttribute,
    source,
  });
  const stellarBuffPassiveModule = createStellarGlimmerBuffPassiveModule([stellarAmount, stellarSeconds], {
    attribute: stellarAttribute,
    source,
  });
  return {
    onKitEvent: (event, context, combatant) => {
      reactionBuffPassiveModule.onKitEvent?.(event, context, combatant);
      stellarBuffPassiveModule.onKitEvent?.(event, context, combatant);
    },
  };
};
