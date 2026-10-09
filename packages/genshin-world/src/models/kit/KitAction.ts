import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";

// An action a kit plays: its hits in the order their hitmarks fall, how long it lasts, the zone the body turns to its
// Target within when it starts, and what it sets going when it starts, if anything: the effects it adds to the party's
export interface KitAction {
  hits: KitHit[];
  onStart?: (start: { body: KitBody; combatant: Combatant; effects: KitEffect[] }) => void;
  seconds: number;
  // The stamina the action drains each second it plays, if it drains any
  staminaPerSecond?: number;
  targetingArea: AttackArea;
}
