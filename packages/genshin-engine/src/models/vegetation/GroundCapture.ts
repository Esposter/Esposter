import type { OrthographicCamera, Vector2 } from "three";
import type { MeshBasicNodeMaterial, RenderTarget, UniformNode } from "three/webgpu";

// The ground under the camera seen from straight above: its colour in red, green and blue and its height in alpha,
// Over a square the grass reads its footing and its colour from
export interface GroundCapture {
  camera: OrthographicCamera;
  // The square's centre in world coordinates, across the ground
  center: UniformNode<"vec2", Vector2>;
  material: MeshBasicNodeMaterial;
  renderTarget: RenderTarget;
  size: number;
}
