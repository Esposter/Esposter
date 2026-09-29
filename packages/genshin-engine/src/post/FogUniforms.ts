import type { Color } from "three";
import type { UniformNode } from "three/webgpu";

// The haze the far world dissolves into, written by whatever owns the sky: its colour, how thick it is at the base
// Height, how fast it thins above it, and how far from the eye it starts
export interface FogUniforms {
  baseHeight: UniformNode<"float", number>;
  color: UniformNode<"color", Color>;
  density: UniformNode<"float", number>;
  heightFalloff: UniformNode<"float", number>;
  startDistance: UniformNode<"float", number>;
}
