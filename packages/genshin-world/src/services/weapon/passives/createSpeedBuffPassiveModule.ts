import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { buffAttackAndMovementSpeed } from "#src/services/weapon/passives/buffAttackAndMovementSpeed";
import { takeOne } from "@esposter/shared";

// A passive that raises its wielder's ATK and Movement SPD by the rank's percentage for the rank's seconds, each time
// An event its predicate names happens to the wielder
export const createSpeedBuffPassiveModule = (
  params: number[],
  source: string,
  checkIsTrigger: (event: KitEvent, combatant: Combatant) => boolean,
): PassiveModule => {
  const percentage = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (!checkIsTrigger(event, combatant)) return;
      buffAttackAndMovementSpeed(kitEffectState, combatant.characterId, percentage, seconds, source);
    },
  };
};
