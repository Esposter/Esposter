import type { Color, Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

// The light every material reads, written once a frame by whatever owns the hour: the direction toward the light in
// World space and its colour, the rim's colour and strength, and how wet the ground stands, from none to soaked
export interface LightUniforms {
  lightColor: UniformNode<"color", Color>;
  rimColor: UniformNode<"color", Color>;
  rimStrength: UniformNode<"float", number>;
  sunDirection: UniformNode<"vec3", Vector3>;
  wetness: UniformNode<"float", number>;
}
