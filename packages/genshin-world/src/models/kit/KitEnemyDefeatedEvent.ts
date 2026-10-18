import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A damage defeated an enemy: the enemy, and the combatant whose hit, tick or reach it was, if one owns it
export interface KitEnemyDefeatedEvent {
  enemy: Enemy;
  kind: KitEventKind.EnemyDefeated;
  striker: Combatant | undefined;
}
