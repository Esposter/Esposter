import type { Node } from "three/webgpu";

// A plan read back where each vertex of a part stands in it: its sample, and its weight, 1 where it is read and 0 where
// Not
export interface PlanCanvasNode {
  sample: Node<"vec4">;
  weight: Node<"float">;
}
