import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { takeOne } from "@esposter/shared";

// Cull the Weak at its rank: defeating an opponent restores its wielder the rank's share of Max HP
export const createCullTheWeakPassiveModule = (params: number[]): WeaponPassiveModule => {
  const healthShare = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.EnemyDefeated || event.striker?.characterId !== combatant.characterId) return;
      const maxHealth = getKitMaxHealth(
        combatant,
        context.kitEffectState.effects,
        context.party,
        context.characterIdCombatantMap,
      );
      changeKitMemberHealth(context, combatant, combatant.characterId, maxHealth * healthShare);
    },
  };
};
