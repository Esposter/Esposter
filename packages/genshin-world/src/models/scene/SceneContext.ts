import type { Camera, Scene } from "three";
import type { Renderer } from "three/webgpu";

// What a scene renders with, which it hands a host that asks: the parity page's tools read its targets, its frame's
// Draw calls and its pipelines from the renderer rather than the page
export interface SceneContext {
  camera: Camera;
  renderer: Renderer;
  scene: Scene;
}
