import type { Node } from "three/webgpu";

import {
  GENSHIN_TONE_CONTRAST,
  GENSHIN_TONE_EXPOSURE,
  TONE_CONTRAST_OFFSET,
  TONE_CURVE_LIFT,
} from "#src/renderer/constants";
import { exp2, max, min, vec3 } from "three/tsl";

// The tone curve as a node, each channel as `toneMapGenshin` maps it, which the post pipeline draws ahead of its output
export const toneMapGenshinNode = (sceneColor: Node<"vec3">): Node<"vec3"> =>
  min(
    max(vec3(1 + TONE_CURVE_LIFT).sub(exp2(sceneColor.mul(-GENSHIN_TONE_EXPOSURE))), 0).pow(
      GENSHIN_TONE_CONTRAST + TONE_CONTRAST_OFFSET,
    ),
    1,
  );
