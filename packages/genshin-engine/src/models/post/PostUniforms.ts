import type { Color } from "three";
import type { UniformNode } from "three/webgpu";

// What the post chain reads that a region or the tuning panel may change without rebuilding it
export interface PostUniforms {
  godraysColor: UniformNode<"color", Color>;
  gradeIntensity: UniformNode<"float", number>;
  outlineColor: UniformNode<"color", Color>;
  // Past this distance an outline thins with the distance, so a far shape keeps its line without turning to ink
  outlineFadeDistance: UniformNode<"float", number>;
  outlineThickness: UniformNode<"float", number>;
}
