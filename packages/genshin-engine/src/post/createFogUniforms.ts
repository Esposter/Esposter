import type { FogUniforms } from "#src/post/FogUniforms";

import { Color } from "three";
import { uniform } from "three/tsl";

// One set per world, read by the fog pass, so the sky retints the haze by writing a colour
export const createFogUniforms = (): FogUniforms => ({
  baseHeight: uniform(0),
  color: uniform(new Color()),
  density: uniform(0),
  heightFalloff: uniform(0),
  startDistance: uniform(0),
});
