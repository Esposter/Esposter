import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";

// An action a kit plays: its hits in the order their hitmarks fall, how long it lasts, the zone the body turns to its
// Target within when it starts, and what it sets going when it starts, if anything: the effects it adds to the party's,
// Given the enemy the body turned to, if it turned to one
export interface KitAction {
  hits: KitHit[];
  // Whether the action is an aimed shot, which turns the body to the camera's aim while the aim is held, not to a target
  isAimed?: true;
  onStart?: (start: { body: KitBody; combatant: Combatant; kitEffectState: KitEffectState; target?: Enemy }) => void;
  seconds: number;
  // The stamina the action drains each second it plays, if it drains any
  staminaPerSecond?: number;
  targetingArea: AttackArea;
}
