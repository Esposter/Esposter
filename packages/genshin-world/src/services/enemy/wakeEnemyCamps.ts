import type { Enemy } from "#src/models/enemy/Enemy";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENGAGED_ENEMY_STATES } from "#src/services/enemy/constants";
import { setEnemyState } from "#src/services/enemy/setEnemyState";

// Alerts every idle enemy whose camp has a member engaged, so a camp turns on its target together
export const wakeEnemyCamps = (enemies: Enemy[]): void => {
  for (const enemy of enemies) {
    if (enemy.state !== EnemyState.Idle) continue;
    const isCampEngaged = enemies.some(
      ({ campId, state }) => campId === enemy.campId && ENGAGED_ENEMY_STATES.includes(state),
    );
    if (isCampEngaged) setEnemyState(enemy, EnemyState.Alert);
  }
};
