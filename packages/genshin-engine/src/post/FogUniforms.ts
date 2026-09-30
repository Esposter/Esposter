import type { Color, Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

// The haze the far world dissolves into, written by whatever owns the sky: its colour, how thick it is at the base
// Height, how fast it thins above it, how far from the eye it starts, and the light it scatters toward the sun: the
// Scattered light's colour and direction, how narrowly it gathers round the sun, and how strongly (none by default)
export interface FogUniforms {
  baseHeight: UniformNode<"float", number>;
  color: UniformNode<"color", Color>;
  density: UniformNode<"float", number>;
  heightFalloff: UniformNode<"float", number>;
  scatterColor: UniformNode<"color", Color>;
  scatterDirection: UniformNode<"vec3", Vector3>;
  scatterPower: UniformNode<"float", number>;
  scatterStrength: UniformNode<"float", number>;
  startDistance: UniformNode<"float", number>;
}
