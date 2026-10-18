import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { takeOne } from "@esposter/shared";

const INFUSION_NEEDLE_STATUS_ID = "infusionNeedle";
const INFUSION_NEEDLE_SECONDS = 5;

// Infusion Needle at its rank: after its wielder picks up an elemental orb or particle, each normal or charged attack it
// Lands deals an extra hit of the rank's share of ATK, for five seconds. Provisional: one extra hit per attack, not per hit
export const createInfusionNeedlePassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackShare = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.EnergyParticleCollected) {
        if (event.characterId === characterId)
          addKitStatus(context.kitEffectState, characterId, {
            id: INFUSION_NEEDLE_STATUS_ID,
            secondsRemaining: INFUSION_NEEDLE_SECONDS,
          });
        return;
      }
      if (
        (event.kind === KitEventKind.NormalAttackLanded || event.kind === KitEventKind.ChargedAttackLanded) &&
        context.activeCombatant.characterId === characterId &&
        checkIsKitStatusActive(context.kitEffectState.effects, characterId, INFUSION_NEEDLE_STATUS_ID)
      )
        queueKitPassiveHit(context, combatant, {
          hitArea: takeOne(event.action.hits, 0).hitArea,
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackShare,
        });
    },
  };
};
