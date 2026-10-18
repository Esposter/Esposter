import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit defeated an enemy: the enemy, and the combatant whose hit it was
export interface KitEnemyDefeatedEvent {
  enemy: Enemy;
  kind: KitEventKind.EnemyDefeated;
  striker: Combatant;
}
