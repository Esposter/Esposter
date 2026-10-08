import type { Node } from "three/webgpu";

// The walkway's paving as its stone reads it: the glow its materials light it with, the normal its rims tilt, and the
// Shade its tones paint it
export interface LoginPaving {
  glow: Node<"vec3">;
  normalNode: Node<"vec3">;
  shade: Node<"vec3">;
}
