import type { Enemy } from "#src/models/enemy/Enemy";

import {
  SUPERCONDUCT_PHYSICAL_RESISTANCE_REDUCTION,
  SUPERCONDUCT_SECONDS,
  SUPERCONDUCT_STATUS_ID,
} from "#src/services/combat/damage/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";

// Superconduct's shred on an enemy it reaches, written in place: 40% off its Physical RES for 12 seconds
export const addSuperconductStatus = (enemy: Enemy): void => {
  addEnemyStatus(enemy, {
    damageTakenBonus: 0,
    id: SUPERCONDUCT_STATUS_ID,
    physicalResistanceReduction: SUPERCONDUCT_PHYSICAL_RESISTANCE_REDUCTION,
    secondsRemaining: SUPERCONDUCT_SECONDS,
  });
};
