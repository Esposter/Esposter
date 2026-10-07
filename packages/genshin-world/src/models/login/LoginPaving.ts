import type { Node } from "three/webgpu";

// The walkway's paving as its stone reads it: the normal its rims tilt, and the shade its tones paint it
export interface LoginPaving {
  normalNode: Node<"vec3">;
  shade: Node<"vec3">;
}
