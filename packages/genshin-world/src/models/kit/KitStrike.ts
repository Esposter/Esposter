import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";

// A hit landing from a body, priced by the combatant that dealt it, which strikes the enemies within its area
export interface KitStrike {
  body: KitBody;
  combatant: Combatant;
  hit: KitHit;
}
