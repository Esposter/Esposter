import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";

// A hit landing from a body, priced by the combatant that dealt it, which strikes the enemies within its area
export interface KitStrike {
  body: KitBody;
  combatant: Combatant;
  hit: KitHit;
  // The one enemy the hit lands on, instead of each enemy its area reaches, if it lands on one
  target?: Enemy;
}
