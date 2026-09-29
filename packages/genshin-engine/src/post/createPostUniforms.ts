import type { PostUniforms } from "#src/post/PostUniforms";

import { Color } from "three";
import { uniform } from "three/tsl";

// A plum ink rather than black, so an outline reads as drawn over the colour beside it, and a warm shaft of light
export const createPostUniforms = (): PostUniforms => ({
  godraysColor: uniform(new Color(0xfff1d6)),
  gradeIntensity: uniform(1),
  outlineColor: uniform(new Color(0x2a2238)),
  outlineFadeDistance: uniform(40),
  outlineThickness: uniform(0.003),
});
