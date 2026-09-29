import type { LightUniforms } from "#src/nodes/LightUniforms";
import type { WaterUniforms } from "#src/water/WaterUniforms";
import type { Node } from "three/webgpu";

import { voronoi2d } from "three/examples/jsm/tsl/math/voronoiNoise.js";
import { float, positionWorld, smoothstep, time } from "three/tsl";

const CAUSTIC_SCALE = 0.35;
const CAUSTIC_SPEED = 0.6;
// The shimmer on a floor under water: two layers of animated Voronoi cells multiplied, so light gathers into bright
// Veins, stepped into a hard band as the game draws them. It lights only what lies under the water's level, fading
// Out by the deep depth, and follows the light's colour, so it dims at night
export const createCausticsNode = (
  { lightColor }: Pick<LightUniforms, "lightColor">,
  { causticStrength, deepDepth, level }: Pick<WaterUniforms, "causticStrength" | "deepDepth" | "level">,
): Node<"vec3"> => {
  const floorPosition = positionWorld.xz.mul(CAUSTIC_SCALE);
  const drift = time.mul(CAUSTIC_SPEED);
  const cells = voronoi2d(floorPosition, drift).mul(voronoi2d(floorPosition.mul(1.7), drift.mul(1.3)));
  const veins = smoothstep(0.35, 0.45, cells);
  const depthBelow = level.sub(positionWorld.y);
  const fade = smoothstep(0, 0.3, depthBelow).mul(float(1).sub(smoothstep(0, deepDepth, depthBelow)));
  return lightColor.mul(veins.mul(fade).mul(causticStrength));
};
