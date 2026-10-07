import type { Vector } from "#src/models/shared/Vector";

// One pixel of a part's interior as the stone light's solve reads it: the exports' albedo there, the reference's colour
// As the screen shows it, in linear channels before the display's encoding, the light the material adds after lighting, the ramp coordinate and the harmonics its
// Normal and the sun give, its height over the scene's ground, the share of light the scene's occlusion leaves it, how
// Much of it the haze hides and how far it looks toward the haze's sunward glow, the part it is of, and the bin it is
// Averaged in within that part
export interface StoneLightSample {
  albedo: Vector;
  bin: string;
  display: Vector;
  emission: Vector;
  harmonics: number[];
  height: number;
  occlusion: number;
  opacity: number;
  part: number;
  rampCoordinate: number;
  scatter: number;
}
