import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitbox } from "#src/models/kit/KitHitbox";

// A hit landing from a body, priced by the combatant that dealt it, which strikes the enemies within its area, and the
// Kind of attack it is dealt as when it is one of its kit's own actions
export interface KitStrike {
  attackTag?: AttackTag;
  body: KitBody;
  combatant: Combatant;
  hit: KitHit;
  // The one enemy the hit lands on, instead of each enemy its area reaches, if it lands on one
  target?: Enemy;
  // The reach the hit's target gives it, when it reaches the enemies about its target in a hitbox rather than alone or by the
  // Body's area
  hitbox?: KitHitbox;
  // Whether the hit is an aimed shot's, which takes an enemy's weak point when the enemy has one
  isAimed?: true;
}
