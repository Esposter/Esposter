import type { Color, Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

// The light every material reads, written once a frame by whatever owns the hour: the sun's direction toward the
// Sun in world space, and the rim's colour and strength
export interface LightUniforms {
  rimColor: UniformNode<"color", Color>;
  rimStrength: UniformNode<"float", number>;
  sunDirection: UniformNode<"vec3", Vector3>;
}
