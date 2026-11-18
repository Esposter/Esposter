import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const SOLAR_SHINE_SKILL_AND_BURST_ID = "solarShineSkillAndBurst";
const SOLAR_SHINE_NORMAL_ATTACK_SOURCE = "solarShineNormalAttack";
const SOLAR_SHINE_SECONDS = 6;

// Solar Shine at its rank: a normal attack hit its wielder deals raises its Elemental Skill and Elemental Burst DMG by the
// Rank's amount for six seconds, and an Elemental Skill or Elemental Burst hit raises its Normal Attack DMG by the same
export const createSolarShinePassiveModule = (params: number[]): PassiveModule => {
  const amount = takeOne(params, 0);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      (strike.attackTag === AttackTag.ElementalSkill || strike.attackTag === AttackTag.ElementalBurst) &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, SOLAR_SHINE_SKILL_AND_BURST_ID)
        ? amount
        : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      if (event.attackTag === AttackTag.NormalAttack)
        addKitStatus(kitEffectState, combatant.characterId, {
          id: SOLAR_SHINE_SKILL_AND_BURST_ID,
          secondsRemaining: SOLAR_SHINE_SECONDS,
        });
      else if (event.attackTag === AttackTag.ElementalSkill || event.attackTag === AttackTag.ElementalBurst)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount,
          attribute: Attribute.NormalAttackDamageBonus,
          secondsRemaining: SOLAR_SHINE_SECONDS,
          source: SOLAR_SHINE_NORMAL_ATTACK_SOURCE,
        });
    },
  };
};
