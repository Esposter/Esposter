import type { Node } from "three/webgpu";

import { interleavedGradientNoise, screenCoordinate } from "three/tsl";

// Whether a pixel of something fading in draws, its share of the pixels its visibility, from none to all, picked by a
// Fixed noise over the screen. What fades out as it fades in draws the pixels it does not, so a change of detail
// Neither doubles a pixel nor opens a gap
export const createDitherFadeNode = (visibility: Node<"float">): Node<"bool"> =>
  interleavedGradientNoise(screenCoordinate.xy).lessThan(visibility);
