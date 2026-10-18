import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { takeOne } from "@esposter/shared";

// A passive that restores its wielder the rank's share of Max HP for each Elemental Orb or Particle the wielder collects
export const createParticleHealPassiveModule = (params: number[]): PassiveModule => {
  const healthShare = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.EnergyParticleCollected || event.characterId !== combatant.characterId) return;
      const maxHealth = getKitMaxHealth(
        combatant,
        context.kitEffectState.effects,
        context.party,
        context.characterIdCombatantMap,
      );
      changeKitMemberHealth(context, combatant, combatant.characterId, maxHealth * healthShare * event.count);
    },
  };
};
