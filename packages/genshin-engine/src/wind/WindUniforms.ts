import type { Vector2 } from "three";
import type { UniformNode } from "three/webgpu";

// The one wind every plant, the clouds and later cloth and hair read: which way it blows across the ground, how
// Strong it is at rest, and the gusts that roll across it as bands, their strength, their width and their speed
export interface WindUniforms {
  direction: UniformNode<"vec2", Vector2>;
  gustSpeed: UniformNode<"float", number>;
  gustStrength: UniformNode<"float", number>;
  // The distance between one gust band and the next, in metres
  gustWidth: UniformNode<"float", number>;
  strength: UniformNode<"float", number>;
}
