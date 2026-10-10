import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";
import type { KitHit } from "#src/models/kit/KitHit";

// An enemy took a hit's damage: the hit as it struck, the kind of attack it was dealt as when it is one of its kit's own
// Actions, the combatant that dealt it, whether it was a CRIT hit, and whether it defeated the enemy
export interface KitDamageTakenEvent {
  attackTag?: AttackTag;
  enemy: Enemy;
  hit: KitHit;
  isCritical: boolean;
  isDefeated: boolean;
  kind: KitEventKind.DamageTaken;
  striker: Combatant;
}
