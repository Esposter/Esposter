import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit landed on an enemy: the element it was dealt as where it deals one, and the combatant that dealt it
export interface KitEnemyHitEvent {
  element: Element | undefined;
  enemy: Enemy;
  kind: KitEventKind.EnemyHit;
  striker: Combatant;
}
