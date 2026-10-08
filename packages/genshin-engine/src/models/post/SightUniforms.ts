import type { Vector2 } from "three";
import type { UniformNode } from "three/webgpu";

// What the sight pass reads each frame, which the scene writes from its own sight: the ground point it spreads from in
// Scene metres, the reach it has spread to, and how strongly it shows (1 while it is on, 0 while it is off)
export interface SightUniforms {
  origin: UniformNode<"vec2", Vector2>;
  radius: UniformNode<"float", number>;
  strength: UniformNode<"float", number>;
}
