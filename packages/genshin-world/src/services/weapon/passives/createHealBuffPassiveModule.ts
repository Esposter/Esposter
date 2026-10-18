import type { Attribute } from "#src/models/character/Attribute";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

// A passive that, after its wielder is healed, raises one of its attributes by the rank's amount for the rank's seconds. A
// Heal is a change of HP that gains a share, which a loss does not, and it counts whether or not its wielder is on the field
export const createHealBuffPassiveModule = (
  params: number[],
  { attribute, source }: { attribute: Attribute; source: string },
): WeaponPassiveModule => {
  const amount = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare <= 0
      )
        return;
      buffKitMember(kitEffectState, combatant.characterId, { amount, attribute, secondsRemaining: seconds, source });
    },
  };
};
