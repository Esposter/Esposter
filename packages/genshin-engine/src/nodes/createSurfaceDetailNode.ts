import type { Node } from "three/webgpu";

import {
  SURFACE_DETAIL_METRES_PER_TEXEL,
  SURFACE_DETAIL_RENDER_GAIN,
  SURFACE_OCTAVE_TEXEL_FREQUENCIES,
} from "#src/nodes/constants";
import { float, mx_noise_float, positionWorld, vec3 } from "three/tsl";

// A surface's procedural detail as a multiplier of its colour about one: each octave a noise at its frequency in world
// Metres, scaled by its amplitude and the render's gain, one noise call an octave. The amplitudes are nodes, never
// Constants written into the shader, so every surface's detail draws in the same program whatever its amplitudes
export const createSurfaceDetailNode = (amplitudes: Node<"float">[]): Node<"float"> =>
  SURFACE_OCTAVE_TEXEL_FREQUENCIES.reduce<Node<"float">>(
    (node, texelFrequency, octave) =>
      node.add(
        mx_noise_float(vec3(positionWorld.mul(texelFrequency / SURFACE_DETAIL_METRES_PER_TEXEL))).mul(
          (amplitudes[octave] ?? float(0)).mul(SURFACE_DETAIL_RENDER_GAIN),
        ),
      ),
    float(1),
  );
