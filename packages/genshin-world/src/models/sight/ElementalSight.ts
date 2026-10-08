import type { GroundPoint } from "genshin-engine";

// Elemental Sight as the world holds it: whether it is on, the ground point it was turned on at, and how long it has
// Spread for. Written in place each frame by the screen that owns the world's input
export interface ElementalSight {
  isOn: boolean;
  origin: GroundPoint;
  spreadSeconds: number;
}
