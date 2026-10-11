import type { GroundPoint } from "genshin-engine";

// A Moondrift a Lunar-Crystallize leaves, a Geo construct: where it stands and the seconds it has left
export interface Moondrift {
  position: GroundPoint;
  secondsRemaining: number;
}
