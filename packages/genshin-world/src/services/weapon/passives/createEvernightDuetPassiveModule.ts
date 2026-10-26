import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const EVERNIGHT_DUET_SKILL_DAMAGE_ID = "evernightDuetSkillDamage";
const EVERNIGHT_DUET_NORMAL_ATTACK_SOURCE = "evernightDuetElementalSkill";

// Evernight Duet at its rank: a Normal Attack hit on an opponent its wielder deals raises its Elemental Skill DMG by the
// Rank's amount for the rank's seconds, and an Elemental Skill hit on an opponent raises its Normal Attack DMG by the
// Rank's second amount for the rank's second seconds. Each raise restarts when its hit lands again
export const createEvernightDuetPassiveModule = (params: number[]): PassiveModule => {
  const skillDamageBonus = takeOne(params, 0);
  const skillDamageSeconds = takeOne(params, 1);
  const normalAttackDamageBonus = takeOne(params, 2);
  const normalAttackDamageSeconds = takeOne(params, 3);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.ElementalSkill &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, EVERNIGHT_DUET_SKILL_DAMAGE_ID)
        ? skillDamageBonus
        : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      if (event.attackTag === AttackTag.NormalAttack)
        addKitStatus(kitEffectState, combatant.characterId, {
          id: EVERNIGHT_DUET_SKILL_DAMAGE_ID,
          secondsRemaining: skillDamageSeconds,
        });
      else if (event.attackTag === AttackTag.ElementalSkill)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: normalAttackDamageBonus,
          attribute: Attribute.NormalAttackDamageBonus,
          secondsRemaining: normalAttackDamageSeconds,
          source: EVERNIGHT_DUET_NORMAL_ATTACK_SOURCE,
        });
    },
  };
};
