import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const BLUNT_CONCLUSION_STATUS_ID = "bluntConclusion";
const BLUNT_CONCLUSION_COOLDOWN_ID = "bluntConclusionCooldown";

// Blunt Conclusion at its rank: after its wielder uses an elemental skill, each normal or charged attack hit it deals adds
// An extra hit at the rank's multiplier of ATK on a small area, for the rank's seconds, once per the rank's cooldown
export const createBluntConclusionPassiveModule = (params: number[]): WeaponPassiveModule => {
  const talentMultiplier = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.SkillUsed) {
        if (event.characterId === combatant.characterId)
          addKitStatus(context.kitEffectState, combatant.characterId, {
            id: BLUNT_CONCLUSION_STATUS_ID,
            secondsRemaining: seconds,
          });
        return;
      }
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag) ||
        !checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, BLUNT_CONCLUSION_STATUS_ID)
      )
        return;
      queueCooldownHit(context, combatant, BLUNT_CONCLUSION_COOLDOWN_ID, cooldownSeconds, {
        hitArea: SMALL_AOE_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
