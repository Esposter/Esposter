import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { spendPartyMemberEnergy } from "#src/services/party/spendPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const SHIMENAWAS_REMINISCENCE_STATUS_ID = "shimenawasReminiscence";

// Shimenawa's Reminiscence. Its four-piece bonus, when its wearer casts an Elemental Skill with the table's first param of
// Energy or more, spends that Energy and raises the DMG of its Normal, Charged and Plunging Attacks by the second param for
// The third param's seconds. It does not trigger again while those run
export const createShimenawasReminiscenceSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const energyCost = takeOne(bonus.params, 0);
  const damageBonus = takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      (strike.attackTag === AttackTag.NormalAttack ||
        strike.attackTag === AttackTag.ChargedAttack ||
        strike.attackTag === AttackTag.PlungingAttack) &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, SHIMENAWAS_REMINISCENCE_STATUS_ID)
        ? damageBonus
        : 0,
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.SkillUsed ||
        event.characterId !== combatant.characterId ||
        checkIsKitStatusActive(
          context.kitEffectState.effects,
          combatant.characterId,
          SHIMENAWAS_REMINISCENCE_STATUS_ID,
        ) ||
        !spendPartyMemberEnergy(context.party, combatant.characterId, energyCost)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: SHIMENAWAS_REMINISCENCE_STATUS_ID,
        secondsRemaining: seconds,
      });
    },
  };
};
