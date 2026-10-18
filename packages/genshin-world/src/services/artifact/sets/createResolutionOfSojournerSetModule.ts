import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// Resolution of Sojourner. Its four-piece bonus raises the CRIT Rate of its wearer's Charged Attacks by the table's first param
export const createResolutionOfSojournerSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const criticalRateBonus = takeOne(bonus.params, 0);
  return {
    getStrikeCriticalRateBonus: (strike) => (strike.attackTag === AttackTag.ChargedAttack ? criticalRateBonus : 0),
  };
};
