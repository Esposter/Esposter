import type { Attribute } from "#src/models/character/Attribute";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

// A passive that, as its wielder uses its Elemental Skill, raises one of its attributes by the rank's amount for the rank's
// Seconds. Each skill restarts the buff, as a buff of the same attribute from the same source does
export const createSkillBuffPassiveModule = (
  params: number[],
  { attribute, source }: { attribute: Attribute; source: string },
): WeaponPassiveModule => {
  const amount = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== combatant.characterId) return;
      buffKitMember(kitEffectState, combatant.characterId, { amount, attribute, secondsRemaining: seconds, source });
    },
  };
};
