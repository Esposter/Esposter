import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { createNormalAttackStatusPassiveModule } from "#src/services/weapon/passives/createNormalAttackStatusPassiveModule";
import { takeOne } from "@esposter/shared";

const EVERNIGHT_DUET_SKILL_DAMAGE_ID = "evernightDuetSkillDamage";
const EVERNIGHT_DUET_NORMAL_ATTACK_SOURCE = "evernightDuetElementalSkill";

// Evernight Duet at its rank: a Normal Attack hit on an opponent its wielder deals raises its Elemental Skill DMG by the
// Rank's amount for the rank's seconds, and an Elemental Skill hit on an opponent raises its Normal Attack DMG by the
// Rank's second amount for the rank's second seconds. Each raise restarts when its hit lands again
export const createEvernightDuetPassiveModule = (params: number[]): PassiveModule =>
  createNormalAttackStatusPassiveModule([AttackTag.ElementalSkill], {
    buff: { amount: takeOne(params, 2), seconds: takeOne(params, 3), source: EVERNIGHT_DUET_NORMAL_ATTACK_SOURCE },
    status: { amount: takeOne(params, 0), id: EVERNIGHT_DUET_SKILL_DAMAGE_ID, seconds: takeOne(params, 1) },
  });
