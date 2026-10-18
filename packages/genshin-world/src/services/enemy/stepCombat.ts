import type { CombatState } from "#src/models/combat/CombatState";
import type { Enemy } from "#src/models/enemy/Enemy";

import { CombatEvent } from "#src/models/combat/CombatEvent";
import { COMBAT_CLEAR_SECONDS, ENGAGED_ENEMY_STATES } from "#src/services/enemy/constants";

const isAnyAggravated = (enemies: Iterable<Enemy>): boolean => {
  for (const { state } of enemies) if (ENGAGED_ENEMY_STATES.includes(state)) return true;
  return false;
};
// One fixed step of the world's combat, written into the state in place. The party enters combat once an enemy is
// Aggravated on it, and leaves once none has been for the grace period. It returns the change the step made, if any
export const stepCombat = (
  combat: CombatState,
  enemies: Iterable<Enemy>,
  stepSeconds: number,
): CombatEvent | undefined => {
  if (isAnyAggravated(enemies)) {
    combat.clearSeconds = 0;
    if (combat.isInCombat) return undefined;
    combat.isInCombat = true;
    return CombatEvent.Enter;
  }

  if (!combat.isInCombat) return undefined;
  combat.clearSeconds += stepSeconds;
  if (combat.clearSeconds < COMBAT_CLEAR_SECONDS) return undefined;
  combat.clearSeconds = 0;
  combat.isInCombat = false;
  return CombatEvent.Leave;
};
