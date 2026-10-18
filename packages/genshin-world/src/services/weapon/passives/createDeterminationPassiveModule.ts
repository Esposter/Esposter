import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffAttackAndMovementSpeed } from "#src/services/weapon/passives/buffAttackAndMovementSpeed";
import { takeOne } from "@esposter/shared";

// Determination at its rank: a burst its wielder uses raises its ATK and Movement SPD by the rank's percentage for the
// Rank's seconds
export const createDeterminationPassiveModule = (params: number[]): WeaponPassiveModule => {
  const percentage = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.BurstUsed || event.characterId !== combatant.characterId) return;
      buffAttackAndMovementSpeed(kitEffectState, combatant.characterId, percentage, seconds, "determination");
    },
  };
};
