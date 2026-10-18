import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAttackTagDamageSetModule } from "#src/services/artifact/sets/createAttackTagDamageSetModule";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { endPartyMemberSkillCooldown } from "#src/services/party/endPartyMemberSkillCooldown";
import { takeOne } from "@esposter/shared";

const GAMBLER_COOLDOWN_ID = "gamblerCooldown";

// Gambler. Its two-piece bonus raises the DMG of its wearer's Elemental Skills by the table's first param. Its four-piece
// Bonus ends its wearer's skill cooldown when its wearer defeats an opponent, once every the table's first param's seconds.
// The table's second param is its chance, a whole one, so the end is never rolled
export const createGamblerSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const { params } = bonus;
  if (bonus.pieceCount === 2)
    return createAttackTagDamageSetModule({ amount: takeOne(params, 0), attackTag: AttackTag.ElementalSkill });
  const cooldownSeconds = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.EnemyDefeated ||
        event.striker?.characterId !== combatant.characterId ||
        !startKitCooldown(context.kitEffectState, combatant.characterId, GAMBLER_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      endPartyMemberSkillCooldown(context.party, combatant.characterId);
    },
  };
};
