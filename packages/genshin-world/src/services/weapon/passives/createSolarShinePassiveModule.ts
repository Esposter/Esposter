import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { createNormalAttackStatusPassiveModule } from "#src/services/weapon/passives/createNormalAttackStatusPassiveModule";
import { takeOne } from "@esposter/shared";

const SOLAR_SHINE_SKILL_AND_BURST_ID = "solarShineSkillAndBurst";
const SOLAR_SHINE_NORMAL_ATTACK_SOURCE = "solarShineNormalAttack";
const SOLAR_SHINE_SECONDS = 6;

// Solar Shine at its rank: a normal attack hit its wielder deals raises its Elemental Skill and Elemental Burst DMG by
// The rank's amount for six seconds, and an Elemental Skill or Elemental Burst hit raises its Normal Attack DMG by the
// Same
export const createSolarShinePassiveModule = (params: number[]): PassiveModule => {
  const amount = takeOne(params, 0);
  return createNormalAttackStatusPassiveModule([AttackTag.ElementalSkill, AttackTag.ElementalBurst], {
    buff: { amount, seconds: SOLAR_SHINE_SECONDS, source: SOLAR_SHINE_NORMAL_ATTACK_SOURCE },
    status: { amount, id: SOLAR_SHINE_SKILL_AND_BURST_ID, seconds: SOLAR_SHINE_SECONDS },
  });
};
