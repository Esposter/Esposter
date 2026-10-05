import type { Color, DataTexture } from "three";
import type { UniformArrayNode, UniformNode } from "three/webgpu";

// The stone's light, shared by every stone material and written once an hour by `applyStoneLight`: the sun's colour
// Through the toon ramp, the sky's light as spherical harmonics, the light fading with height at the ground, and the
// Sun's own colour at its strength, which a
// Face's shadowed light is read against for how much of the sun reaches it
export interface StoneLightUniforms {
  harmonics: UniformArrayNode<"vec3">;
  heightFade: UniformNode<"color", Color>;
  ramp: DataTexture;
  sunRadiance: UniformNode<"color", Color>;
}
