import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
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
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare >= 0 ||
        event.sourceCharacterId !== undefined ||
        !startKitCooldown(
          context.kitEffectState,
          combatant.characterId,
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
