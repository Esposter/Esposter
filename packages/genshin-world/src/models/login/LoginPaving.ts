import type { Node } from "three/webgpu";

// The walkway's paving as its stone reads it: the normal its rims tilt, and the shade its pockets darken
export interface LoginPaving {
  normalNode: Node<"vec3">;
  shade: Node<"float">;
}
