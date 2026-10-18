import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";

import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { POLESTAR_PHYSICAL_RES_REDUCTION, POLESTAR_SHRED_STATUS_ID } from "#src/services/kit/constants";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";

// The Physical RES a Polestar Field takes off each enemy standing inside it, written in place on every step. The
// Status holds for one step: the field refreshes it before the strikes of the same kit step, so they all see it, and
// The enemy's own step runs its seconds down, so an enemy that leaves the field loses it on that step
export const shredPolestarEnemies = ({ enemyMap }: KitContext, field: KitField): void => {
  for (const enemy of enemyMap.values())
    if (checkIsInKitField(field, enemy.position))
      addEnemyStatus(enemy, {
        damageTakenBonus: 0,
        id: POLESTAR_SHRED_STATUS_ID,
        physicalResistanceReduction: POLESTAR_PHYSICAL_RES_REDUCTION,
        secondsRemaining: FIXED_STEP_SECONDS,
      });
};
