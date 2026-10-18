import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { takeOne } from "@esposter/shared";

// Cull the Weak at its rank: defeating an opponent restores its wielder the rank's share of Max HP
export const createCullTheWeakPassiveModule = (params: number[]): WeaponPassiveModule => {
  const healthShare = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.EnemyDefeated || event.striker?.characterId !== combatant.characterId) return;
      changeKitMemberHealth(context, combatant, combatant.characterId, combatant.attributes.maxHealth * healthShare);
    },
  };
};
