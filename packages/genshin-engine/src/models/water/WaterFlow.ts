import type { Vector2 } from "three";
import type { UniformNode } from "three/webgpu";

// Which way a water surface's ripples and foam are carried, as a unit vector across the ground, and how fast, in metres a second
export interface WaterFlow {
  direction: UniformNode<"vec2", Vector2>;
  speed: UniformNode<"float", number>;
}
