import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit landed on an enemy: the attack tag of the strike that landed it, the element it was dealt as where it deals one,
// And the combatant that dealt it
export interface KitEnemyHitEvent {
  attackTag?: AttackTag;
  element?: Element;
  enemy: Enemy;
  kind: KitEventKind.EnemyHit;
  striker: Combatant;
}
