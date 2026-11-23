import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { SUPERCONDUCT_STATUS_ID } from "#src/services/combat/damage/constants";
import { takeOne } from "@esposter/shared";

// Disenchantment in Deep Shadow's four-piece. It raises the DMG the wearer's own Superconduct reactions deal by the
// First param, And the wearer's attacks on an enemy under Superconduct gain the second param of CRIT Rate. The third
// Param, the Stellar-Conduct DMG bonus, is not read: the direct Stellar damage path does not take this set's bonus yet,
// So it is the blocker the set names
export const createDisenchantmentInDeepShadowSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const superconductDamageBonus = takeOne(bonus.params, 0);
  const criticalRateBonus = takeOne(bonus.params, 1);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }) =>
      member.characterId === combatant.characterId && reactionType === TransformativeReactionType.Superconduct
        ? { damageBonus: superconductDamageBonus }
        : {},
    getStrikeCriticalRateBonus: (_strike, enemy) =>
      enemy.statuses.some(({ id }) => id === SUPERCONDUCT_STATUS_ID) ? criticalRateBonus : 0,
  };
};
