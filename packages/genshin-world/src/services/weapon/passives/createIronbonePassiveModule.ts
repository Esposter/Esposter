import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { createSkillBuffPassiveModule } from "#src/services/weapon/passives/createSkillBuffPassiveModule";
import { takeOne } from "@esposter/shared";

// Ironbone (Fleuve Cendre Ferryman) at its rank: an Elemental Skill its wielder deals takes the rank's CRIT Rate, and
// Using one raises its Energy Recharge by the rank's amount for the rank's seconds, the skill buff on the params after
// The CRIT Rate
export const createIronbonePassiveModule = (params: number[]): PassiveModule => {
  const criticalRateBonus = takeOne(params, 0);
  return {
    ...createSkillBuffPassiveModule(params.slice(1), { attributes: [Attribute.EnergyRecharge], source: "ironbone" }),
    getStrikeCriticalRateBonus: ({ attackTag }) => (attackTag === AttackTag.ElementalSkill ? criticalRateBonus : 0),
  };
};
