import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffAttackAndMovementSpeed } from "#src/services/weapon/passives/buffAttackAndMovementSpeed";
import { takeOne } from "@esposter/shared";

// Guerilla Tactics at its rank: defeating an opponent raises its wielder's ATK and Movement SPD by the rank's percentage for
// The rank's seconds
export const createGuerillaTacticsPassiveModule = (params: number[]): WeaponPassiveModule => {
  const percentage = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.EnemyDefeated || event.striker?.characterId !== combatant.characterId) return;
      buffAttackAndMovementSpeed(kitEffectState, combatant.characterId, percentage, seconds, "guerillaTactics");
    },
  };
};
