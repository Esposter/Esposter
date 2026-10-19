import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { startPassiveEnemyStrikeCooldown } from "#src/services/weapon/passives/startPassiveEnemyStrikeCooldown";
import { takeOne } from "@esposter/shared";

const ITINERANT_HERO_DISABLED_ID = "itinerantHeroDisabled";
const ITINERANT_HERO_SECONDS = 5;
const ITINERANT_HERO_SOURCE = "itinerantHero";

// Itinerant Hero at its rank: the DMG its wielder deals is raised by the rank's percentage, which taking DMG disables for five
// Seconds. The bonus is priced as a passive, so the disabling takes off as much as it gives for those seconds, once however
// Much DMG the wielder takes in them
export const createItinerantHeroPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    getPassiveBonuses: () => [{ amount: damageBonus, attribute: Attribute.AllDamageBonus }],
    onKitEvent: (event, context, combatant) => {
      if (
        !startPassiveEnemyStrikeCooldown(
          event,
          context.kitEffectState,
          combatant,
          ITINERANT_HERO_DISABLED_ID,
          ITINERANT_HERO_SECONDS,
        )
      )
        return;
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: -damageBonus,
        attribute: Attribute.AllDamageBonus,
        secondsRemaining: ITINERANT_HERO_SECONDS,
        source: ITINERANT_HERO_SOURCE,
      });
    },
  };
};
