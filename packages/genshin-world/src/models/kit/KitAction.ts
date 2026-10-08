import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitHit } from "#src/models/kit/KitHit";

// An action a kit plays: its hits in the order their hitmarks fall, how long it lasts, and the zone the body turns to
// Its target within when it starts
export interface KitAction {
  hits: KitHit[];
  seconds: number;
  targetingArea: AttackArea;
}
