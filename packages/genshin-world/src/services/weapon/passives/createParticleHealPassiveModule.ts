import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { takeOne } from "@esposter/shared";

// A passive that restores its wielder the rank's share of Max HP for each Elemental Orb or Particle the wielder collects
export const createParticleHealPassiveModule = (params: number[]): WeaponPassiveModule => {
  const healthShare = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.EnergyParticleCollected || event.characterId !== combatant.characterId) return;
      changeKitMemberHealth(
        context,
        combatant,
        combatant.characterId,
        combatant.attributes.maxHealth * healthShare * event.count,
      );
    },
  };
};
