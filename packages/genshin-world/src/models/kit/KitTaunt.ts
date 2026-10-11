import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";

// An entity placed where its character cast it that draws the enemies' strikes while it stands, with the health they
// Take from it, and which explodes once, if it explodes, when its seconds run out or its health is gone. The explosion is
// Priced by the combatant that cast it, as it stood then
export interface KitTaunt {
  body: KitBody;
  combatant: Combatant;
  // The damage each enemy's strike dealt it since the last step, which the step sends to the kits and empties
  damagesTaken: number[];
  explosion?: KitHit;
  health: number;
  kind: "taunt";
  secondsRemaining: number;
}
