import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitStatusTickedEvent } from "#src/models/kit/KitStatusTickedEvent";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";

// The statuses on the standing enemies that strike on their own schedule, run on by a step: each tick that falls due
// While its status lasts is an event its kit answers, and the next falls a full interval on
export const tickEnemyStatuses = (enemies: Iterable<Enemy>, stepSeconds: number): KitStatusTickedEvent[] => {
  const events: KitStatusTickedEvent[] = [];
  for (const enemy of enemies) {
    if (enemy.state === EnemyState.Dead) continue;
    for (const status of enemy.statuses) {
      if (status.nextTickSeconds === undefined || status.tickIntervalSeconds === undefined) continue;
      status.nextTickSeconds -= stepSeconds;
      while (status.nextTickSeconds <= 0 && status.secondsRemaining > 0) {
        events.push({ enemy, kind: KitEventKind.StatusTicked, status });
        status.nextTickSeconds += status.tickIntervalSeconds;
      }
    }
  }
  return events;
};
