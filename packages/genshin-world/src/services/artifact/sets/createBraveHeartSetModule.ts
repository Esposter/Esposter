import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { takeOne } from "@esposter/shared";

// Brave Heart. Its four-piece bonus raises the DMG its wearer's strikes deal.
// It applies to an enemy holding more than the table's second param of its max HP, by the first param.
// The enemy's health is read as the hit prices it.
export const createBraveHeartSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const damageBonus = takeOne(bonus.params, 0);
  const healthShare = takeOne(bonus.params, 1);
  return { getStrikeDamageBonus: (_strike, enemy) => (enemy.health > enemy.maxHealth * healthShare ? damageBonus : 0) };
};
