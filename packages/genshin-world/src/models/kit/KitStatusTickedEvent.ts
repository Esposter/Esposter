import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A status on an enemy that strikes on its own schedule fell due: the enemy and the status
export interface KitStatusTickedEvent {
  enemy: Enemy;
  kind: KitEventKind.StatusTicked;
  status: EnemyStatus;
}
