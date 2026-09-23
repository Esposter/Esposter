import type { Vector3Tuple } from "three";
import type { Promisable } from "type-fest";
// A thing in the world a player uses by standing at it: where they stand, the box outlined around it while it is the
// One in reach, and what its key does
export interface WorldPrompt {
  id: string;
  // The outlined box, from its lowest corner to its highest
  max: Vector3Tuple;
  min: Vector3Tuple;
  run: () => Promisable<void>;
  standPosition: Vector3Tuple;
  // What the key does, named on the label: "Open", "Close"
  title: string;
}
