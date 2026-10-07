import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";

// One bin a stone solve reads: its pixels, their mean colour as the screen shows it, in linear channels before the
// Display's encoding, and that colour taken back through the tone curve and the white balance's inverse
export interface StoneBin {
  displayColor: Vector;
  samples: StoneLightSample[];
  sceneColor: Vector;
}
