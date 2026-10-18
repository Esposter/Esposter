import type { Node } from "three/webgpu";

export interface GrassCell {
  // The blade's turn about the vertical
  angle: Node<"float">;
  // The ground's colour and height under the cell
  captured: Node<"vec4">;
  // The cell's ground point, in world coordinates
  ground: Node<"vec2">;
  // The blade's size, zero where the cell grows none: outside the ring's fade, off green ground, under water or not
  // grown by the density
  size: Node<"float">;
}
