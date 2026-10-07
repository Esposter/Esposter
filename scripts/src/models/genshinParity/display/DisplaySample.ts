import type { Vector } from "#src/models/shared/Vector";

// One pixel the display pass reads: the exports' unlit colour there, and the reference's colour as the screen shows
// It, in linear channels before the display's encoding
export interface DisplaySample {
  albedo: Vector;
  display: Vector;
}
