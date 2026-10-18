import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const ITINERANT_HERO_DISABLED_ID = "itinerantHeroDisabled";
const ITINERANT_HERO_SECONDS = 5;
const ITINERANT_HERO_SOURCE = "itinerantHero";

// Itinerant Hero at its rank: the DMG its wielder deals is raised by the rank's percentage, which taking DMG disables for five
// Seconds. The bonus is priced as a passive, so the disabling takes off as much as it gives for those seconds, once however
// Much DMG the wielder takes in them
export const createItinerantHeroPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    getPassiveBonuses: () => [{ amount: damageBonus, attribute: Attribute.AllDamageBonus }],
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare >= 0 ||
        event.sourceCharacterId !== undefined ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, ITINERANT_HERO_DISABLED_ID)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: ITINERANT_HERO_DISABLED_ID,
        secondsRemaining: ITINERANT_HERO_SECONDS,
      });
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: -damageBonus,
        attribute: Attribute.AllDamageBonus,
        secondsRemaining: ITINERANT_HERO_SECONDS,
        source: ITINERANT_HERO_SOURCE,
      });
    },
  };
};
