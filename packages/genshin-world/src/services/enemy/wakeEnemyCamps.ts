import type { Enemy } from "#src/models/enemy/Enemy";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENGAGED_ENEMY_STATES } from "#src/services/enemy/constants";
import { setEnemyState } from "#src/services/enemy/setEnemyState";

// Alerts every idle enemy whose camp has a member engaged, so a camp turns on its target together
export const wakeEnemyCamps = (enemies: Enemy[]): void => {
  // The camps with a member engaged, gathered in one pass so each idle enemy is a lookup rather than a scan of the list
  const engagedCampIds = new Set(
    enemies.filter(({ state }) => ENGAGED_ENEMY_STATES.includes(state)).map(({ campId }) => campId),
  );
  for (const enemy of enemies)
    if (enemy.state === EnemyState.Idle && engagedCampIds.has(enemy.campId)) setEnemyState(enemy, EnemyState.Alert);
};
