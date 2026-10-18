import type { AttackArea } from "#src/models/kit/AttackArea";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { takeOne } from "@esposter/shared";

const CRUSH_STATUS_ID = "crush";
const CRUSH_COOLDOWN_SECONDS = 15;
// Provisional: the game's small AoE is not in the dump, so the extra hit reaches a two-metre circle about the wielder
const CRUSH_AREA: AttackArea = { angle: 2 * Math.PI, height: 5, radius: 2 };

// Crush at its rank: each normal or charged attack hit has the rank's chance of an extra hit at the rank's multiplier of
// ATK, on the area, and a proc holds off the next for fifteen seconds
export const createCrushPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chance = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag) ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, CRUSH_STATUS_ID) ||
        context.random() >= chance
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: CRUSH_STATUS_ID,
        secondsRemaining: CRUSH_COOLDOWN_SECONDS,
      });
      queueKitPassiveHit(context, combatant, {
        hitArea: CRUSH_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
