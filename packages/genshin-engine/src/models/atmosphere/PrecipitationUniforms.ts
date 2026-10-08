import type { Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

// What the particles are drawn with, written by whatever owns the weather: the share drawn, the eye they gather round,
// How each kind falls, as its settings' values, and the share of the splashes drawn where rain meets the ground
export interface PrecipitationUniforms {
  density: UniformNode<"float", number>;
  eye: UniformNode<"vec3", Vector3>;
  fallSpeed: UniformNode<"float", number>;
  length: UniformNode<"float", number>;
  opacity: UniformNode<"float", number>;
  splashDensity: UniformNode<"float", number>;
  sway: UniformNode<"float", number>;
  width: UniformNode<"float", number>;
  windDrift: UniformNode<"float", number>;
}
