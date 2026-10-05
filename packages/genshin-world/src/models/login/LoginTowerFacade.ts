import type { Node } from "three/webgpu";

// The towers' surfaces as their stone reads them: the shade over the stone, where a tower stands solid, and the release
// Of the canvases both are drawn in
export interface LoginTowerFacade {
  dispose: () => void;
  shade: Node<"vec3">;
  solid: Node<"float">;
}
