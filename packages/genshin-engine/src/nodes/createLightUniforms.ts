import type { LightUniforms } from "#src/nodes/LightUniforms";

import { Color, Vector3 } from "three";
import { uniform } from "three/tsl";

// One set per world, shared by every material, so moving the sun is three writes rather than a pass over materials
export const createLightUniforms = (): LightUniforms => ({
  lightColor: uniform(new Color()),
  rimColor: uniform(new Color()),
  rimStrength: uniform(0),
  sunDirection: uniform(new Vector3(0, 1, 0)),
});
