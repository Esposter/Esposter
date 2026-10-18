import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit landed on an enemy's weak point: the enemy, and the combatant that dealt the hit
export interface KitWeakPointHitEvent {
  enemy: Enemy;
  kind: KitEventKind.WeakPointHit;
  striker: Combatant;
}
