import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { takeOne } from "@esposter/shared";

// Brave Heart. Its four-piece bonus raises the DMG its wearer's strikes deal to an enemy with more than the table's second
// Param of its max HP by the first, the enemy's health read as the hit prices it
export const createBraveHeartSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const damageBonus = takeOne(bonus.params, 0);
  const healthShare = takeOne(bonus.params, 1);
  return { getStrikeDamageBonus: (_strike, enemy) => (enemy.health > enemy.maxHealth * healthShare ? damageBonus : 0) };
};
