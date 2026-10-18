import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { checkIsEnemyAffectedByElement } from "#src/services/combat/aura/checkIsEnemyAffectedByElement";
import { takeOne } from "@esposter/shared";

// Blizzard Strayer. Its four-piece bonus raises the CRIT Rate its wearer's strikes deal to an enemy under Cryo by the table's
// First param, and by its second more against an enemy that is Frozen, the two read as each hit is priced
export const createBlizzardStrayerSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const cryoCriticalRateBonus = takeOne(bonus.params, 0);
  const frozenCriticalRateBonus = takeOne(bonus.params, 1);
  return {
    getStrikeCriticalRateBonus: (_strike, enemy) =>
      (checkIsEnemyAffectedByElement(enemy, Element.Cryo) ? cryoCriticalRateBonus : 0) +
      (enemy.elementalState.auras.has(AuraType.Freeze) ? frozenCriticalRateBonus : 0),
  };
};
