import type { Node } from "three/webgpu";

import { SURFACE_OCTAVE_TEXEL_FREQUENCIES } from "#src/nodes/constants";
import { float, mx_noise_float, positionWorld, vec3 } from "three/tsl";

// A surface's procedural detail as a multiplier of its colour about one: each octave a noise at its frequency in its
// Texture's texels, read where the surface stands in them by the texels a metre of the texture spans, scaled by its
// Amplitude, one noise call an octave. The amplitudes and the texel size are nodes, never constants
// Written into the shader, so every surface's detail draws in the same program whatever its amplitudes and its texture
export const createSurfaceDetailNode = (amplitudes: Node<"float">[], texelsPerMetre: Node<"float">): Node<"float"> => {
  const texelPosition = vec3(positionWorld.mul(texelsPerMetre));
  return SURFACE_OCTAVE_TEXEL_FREQUENCIES.reduce<Node<"float">>(
    (node, texelFrequency, octave) =>
      node.add(mx_noise_float(texelPosition.mul(texelFrequency)).mul(amplitudes[octave] ?? float(0))),
    float(1),
  );
};
