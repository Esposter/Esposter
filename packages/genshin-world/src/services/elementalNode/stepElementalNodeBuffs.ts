import type { Enemy } from "#src/models/enemy/Enemy";

import { Elements } from "#src/models/Element";
import { checkIsElementalNodeBuffed } from "#src/services/elementalNode/checkIsElementalNodeBuffed";
import { ELEMENTAL_NODE_COOLDOWN_PULSES } from "#src/services/elementalNode/constants";
import { getElementalNodeStatusId } from "#src/services/elementalNode/getElementalNodeStatusId";

// Lifts each node buff an enemy no longer carries, a reaction having spent it, and starts the enemy's cooldown, so the
// Buff cannot return for the pulses that follow. It runs on every step, so the resistance lifts with the buff
export const stepElementalNodeBuffs = (enemy: Enemy): void => {
  for (const element of Elements) {
    const statusId = getElementalNodeStatusId(element);
    if (checkIsElementalNodeBuffed(enemy, element) || !enemy.statuses.some(({ id }) => id === statusId)) continue;
    enemy.statuses = enemy.statuses.filter(({ id }) => id !== statusId);
    enemy.elementalNodePulsesLeft = ELEMENTAL_NODE_COOLDOWN_PULSES;
  }
};
