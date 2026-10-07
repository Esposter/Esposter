import type { StoneLightPixel } from "#src/models/genshinParity/witness/StoneLightPixel";
import type { Vector } from "#src/models/shared/Vector";
import type { SceneFog } from "genshin-world/parity/models/SceneFog";
import type { Matrix3 } from "three";

// A reference's stone as the witness reads it: where the eye stands, the scene's own haze and the white balance its
// Frame passes through, and every part's interior pixel
export interface StoneLightReading {
  eye: Vector;
  fog: SceneFog;
  pixels: StoneLightPixel[];
  whiteBalance: Matrix3;
}
