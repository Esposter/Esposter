import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";

// An entity placed where its character cast it that draws the enemies' strikes while it stands, with the health they
// Take from it, and which explodes once, when its seconds run out or its health is gone. The explosion is priced by the
// Combatant that cast it, as it stood then
export interface KitTaunt {
  body: KitBody;
  combatant: Combatant;
  explosion: KitHit;
  health: number;
  kind: "taunt";
  secondsRemaining: number;
}
