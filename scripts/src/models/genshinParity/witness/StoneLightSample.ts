import type { Vector } from "#src/models/shared/Vector";

// One pixel of a part's interior as the stone light's solve reads it: the exports' albedo there, the reference's colour
// Taken back into scene colour, the light the material adds after lighting, the ramp coordinate and the harmonics its normal and the sun give, how much of it the
// Haze hides and how far it looks toward the haze's sunward glow, and the bin it is averaged in
export interface StoneLightSample {
  albedo: Vector;
  bin: string;
  color: Vector;
  emission: Vector;
  harmonics: number[];
  opacity: number;
  rampCoordinate: number;
  scatter: number;
}
