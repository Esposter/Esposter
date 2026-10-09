import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Element } from "#src/models/Element";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { checkIsEnduringRock } from "#src/services/party/checkIsEnduringRock";
import {
  ENDURING_ROCK_RESISTANCE_REDUCTION,
  ENDURING_ROCK_SECONDS,
  ENDURING_ROCK_STATUS_ID,
} from "#src/services/party/constants";

// Gives an enemy a hit under Enduring Rock strikes its Geo RES drop, before the hit's damage is taken, as a hit's own
// Status is given: the enemy's RES falls for the seconds the status runs, and each hit under it restarts them
export const addEnduringRockStatus = (enemy: Enemy, combatant: Combatant, effects: readonly KitEffect[]): void => {
  if (!checkIsEnduringRock(combatant, effects)) return;
  addEnemyStatus(enemy, {
    damageTakenBonus: 0,
    id: ENDURING_ROCK_STATUS_ID,
    resistanceReduction: { [Element.Geo]: ENDURING_ROCK_RESISTANCE_REDUCTION },
    secondsRemaining: ENDURING_ROCK_SECONDS,
  });
};
