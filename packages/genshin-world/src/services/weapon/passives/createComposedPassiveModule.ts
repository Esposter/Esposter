import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { endPartyMemberSkillCooldown } from "#src/services/party/endPartyMemberSkillCooldown";
import { rollPassiveCooldownProc } from "#src/services/weapon/passives/rollPassiveCooldownProc";
import { takeOne } from "@esposter/shared";

const COMPOSED_COOLDOWN_ID = "composedCooldown";

// Composed at its rank: an Elemental Skill that damages an enemy has the rank's chance to end its own cooldown, and a
// Proc holds off the next for the rank's cooldown in seconds
export const createComposedPassiveModule = (params: number[]): PassiveModule => {
  const chance = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ElementalSkill
      )
        return;
      if (!rollPassiveCooldownProc(context, combatant, COMPOSED_COOLDOWN_ID, chance, cooldownSeconds)) return;
      endPartyMemberSkillCooldown(context.party, combatant.characterId);
    },
  };
};
