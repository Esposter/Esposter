import type { Vector3 } from "three";

// A waterfall as a sheet hung from its lip: the lip's centre, the unit direction across it on the ground, how wide it
// Is and how far it drops to the pool at its foot, in metres
export interface WaterfallSheet {
  across: Vector3;
  drop: number;
  lip: Vector3;
  width: number;
}
