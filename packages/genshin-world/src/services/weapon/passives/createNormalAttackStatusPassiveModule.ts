import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { checkIsOwnDamageTaken } from "#src/services/kit/checkIsOwnDamageTaken";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";

// A passive whose wielder's normal attack hit opens a status, which raises the damage of the wielder's strikes with the
// Skill attack tags it names by its amount while it holds. Each such hit the wielder lands raises its Normal Attack DMG
// By the buff's amount for the buff's seconds. Each raise restarts when its hit lands again
export const createNormalAttackStatusPassiveModule = (
  skillAttackTags: readonly AttackTag[],
  {
    buff,
    status,
  }: {
    buff: { amount: number; seconds: number; source: string };
    status: { amount: number; id: string; seconds: number };
  },
): PassiveModule => {
  const checkIsSkillAttack = (attackTag: AttackTag | undefined) =>
    attackTag !== undefined && skillAttackTags.includes(attackTag);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      checkIsSkillAttack(strike.attackTag) && checkIsKitStatusActive(effects, strike.combatant.characterId, status.id)
        ? status.amount
        : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (!checkIsOwnDamageTaken(event, combatant)) return;
      if (event.attackTag === AttackTag.NormalAttack)
        addKitStatus(kitEffectState, combatant.characterId, { id: status.id, secondsRemaining: status.seconds });
      else if (checkIsSkillAttack(event.attackTag))
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: buff.amount,
          attribute: Attribute.NormalAttackDamageBonus,
          secondsRemaining: buff.seconds,
          source: buff.source,
        });
    },
  };
};
