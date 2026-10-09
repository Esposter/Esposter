import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { Node } from "three/webgpu";

import { SURFACE_DETAIL_RENDER_GAIN } from "#src/nodes/constants";
import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { float, mx_noise_float, positionWorld, vec3 } from "three/tsl";

// A surface's procedural detail as a multiplier of its colour about one: each octave a noise at its frequency in world
// Metres, scaled by its amplitude and the render's gain, one noise call an octave
export const createSurfaceDetailNode = (detail: SurfaceDetail): Node<"float"> =>
  computeSurfaceOctaves(detail).reduce<Node<"float">>(
    (node, { amplitude, frequency }) =>
      node.add(mx_noise_float(vec3(positionWorld.mul(frequency))).mul(amplitude * SURFACE_DETAIL_RENDER_GAIN)),
    float(1),
  );
