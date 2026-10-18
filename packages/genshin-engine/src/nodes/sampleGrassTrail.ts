import type { GrassTrail } from "#src/models/vegetation/GrassTrail";
import type { Node } from "three/webgpu";

import {
  GRASS_TRAIL_EXTENT,
  GRASS_TRAIL_FADE_END_SHARE,
  GRASS_TRAIL_FADE_START_SHARE,
} from "#src/vegetation/constants";
import { float, fract, max, smoothstep, texture } from "three/tsl";

// The bend a point of the ground takes from the grass trail, each component in [-1, 1]. The square repeats, so a point
// reads the texel its cell wraps to, and the bend fades out past the square's reach, where a texel holds another
// stretch of ground
export const sampleGrassTrail = (grassTrail: GrassTrail, ground: Node<"vec2">): Node<"vec2"> => {
  const encoded = texture(grassTrail.texture, fract(ground.div(GRASS_TRAIL_EXTENT))).level(float(0));
  const offset = ground.sub(grassTrail.center).abs();
  const reachShare = max(offset.x, offset.y).div(GRASS_TRAIL_EXTENT / 2);
  const reachFade = float(1).sub(smoothstep(GRASS_TRAIL_FADE_START_SHARE, GRASS_TRAIL_FADE_END_SHARE, reachShare));
  return encoded.xy.mul(2).sub(1).mul(reachFade);
};
