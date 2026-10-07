import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";

// One pixel of a part's interior where the scene puts it, beside the sample the stone light's solve reads there
export interface StoneLightPixel {
  point: Vector;
  sample: StoneLightSample;
}
