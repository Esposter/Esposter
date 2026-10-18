import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

// An action a kit plays: its hits in the order their hitmarks fall, how long it lasts, the zone the body turns to its
// Target within when it starts, and what it sets going when it starts, if anything: the effects it adds to the party's,
// Given the enemy the body turned to, if it turned to one
export interface KitAction {
  hits: KitHit[];
  // Whether the action is an aimed shot, which turns the body to the camera's aim while the aim is held, not to a target
  isAimed?: true;
  // Run as the action starts, played by the character on the field at the enemy it targets, if it targets one
  onStart?: (context: KitContext, target?: Enemy) => void;
  // The length the action plays, if it is decided as it runs: once its seconds reach `atSeconds`, `decide` returns the
  // Seconds it plays from then on, from the state the team holds then, such as the Sourcewater Droplets a charge
  // Picks up
  decideLength?: { atSeconds: number; decide: (context: KitContext) => number };
  seconds: number;
  // The stamina the action drains each second it plays, if it drains any
  staminaPerSecond?: number;
  targetingArea: AttackArea;
}
