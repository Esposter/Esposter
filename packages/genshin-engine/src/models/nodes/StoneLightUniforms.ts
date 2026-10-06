import type { Color, DataTexture } from "three";
import type { UniformArrayNode, UniformNode } from "three/webgpu";

// The stone's light, shared by every stone material and written once an hour by `applyStoneLight`: the sun's colour
// Through the toon ramp, the sky's light as spherical harmonics, the light fading with height at the ground, the
// Sun's own colour at its strength, which a face's shadowed light is read against for how much of the sun reaches it,
// And the haze's colours over the stone away from the sun and toward it, which the post pipeline draws in place of the
// Scene's where a scene hands it the stone's light
export interface StoneLightUniforms {
  harmonics: UniformArrayNode<"vec3">;
  hazeColor: UniformNode<"color", Color>;
  hazeScatterColor: UniformNode<"color", Color>;
  heightFade: UniformNode<"color", Color>;
  ramp: DataTexture;
  sunRadiance: UniformNode<"color", Color>;
}
