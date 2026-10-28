import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { endPartyMemberSkillCooldown } from "#src/services/party/endPartyMemberSkillCooldown";
import { createCooldownProcPassiveModule } from "#src/services/weapon/passives/createCooldownProcPassiveModule";

const COMPOSED_COOLDOWN_ID = "composedCooldown";

// Composed at its rank: an Elemental Skill that damages an enemy has the rank's chance to end its own cooldown, and a
// Proc holds off the next for the rank's cooldown in seconds
export const createComposedPassiveModule = (params: number[]): PassiveModule =>
  createCooldownProcPassiveModule(
    params,
    COMPOSED_COOLDOWN_ID,
    (event, combatant) =>
      event.kind === KitEventKind.DamageTaken &&
      event.striker.characterId === combatant.characterId &&
      event.attackTag === AttackTag.ElementalSkill,
    (context, combatant) => {
      endPartyMemberSkillCooldown(context.party, combatant.characterId);
    },
  );
