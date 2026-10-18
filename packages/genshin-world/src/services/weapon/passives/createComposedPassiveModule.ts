import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { endPartyMemberSkillCooldown } from "#src/services/party/endPartyMemberSkillCooldown";
import { takeOne } from "@esposter/shared";

const COMPOSED_COOLDOWN_ID = "composedCooldown";

// Composed at its rank: an Elemental Skill that damages an enemy has the rank's chance to end its own cooldown, and a proc
// Holds off the next for the rank's cooldown in seconds
export const createComposedPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chance = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ElementalSkill ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, COMPOSED_COOLDOWN_ID) ||
        context.random() >= chance
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: COMPOSED_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      endPartyMemberSkillCooldown(context.party, combatant.characterId);
    },
  };
};
