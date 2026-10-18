import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { runDownSeconds } from "#src/services/runDownSeconds";

// The statuses on the standing enemies that strike on their own schedule, run on by a step: each tick that falls due
// While its status lasts is an event its kit answers, raised into the outbox given, and the next falls a full interval on
export const tickEnemyStatuses = (enemies: Iterable<Enemy>, stepSeconds: number, outbox: KitEvent[]): void => {
  for (const enemy of enemies) {
    if (enemy.state === EnemyState.Dead) continue;
    for (const status of enemy.statuses) {
      if (status.nextTickSeconds === undefined || status.tickIntervalSeconds === undefined) continue;
      status.nextTickSeconds = runDownSeconds(status.nextTickSeconds, stepSeconds);
      while (status.nextTickSeconds <= 0 && status.secondsRemaining > 0) {
        outbox.push({ enemy, kind: KitEventKind.StatusTicked, status });
        status.nextTickSeconds += status.tickIntervalSeconds;
      }
    }
  }
};
