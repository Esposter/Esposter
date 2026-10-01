import type { SkyUniforms } from "genshin-engine";
import type { Camera, Scene } from "three";
import type { Renderer } from "three/webgpu";

// What a scene renders with, which it hands a host that asks: the parity page's tools read its targets, its frame's
// Draw calls and its pipelines from the renderer rather than the page, and its sky's sun and moon, which a sky's
// Colours are solved under
export interface SceneContext {
  camera: Camera;
  renderer: Renderer;
  scene: Scene;
  sky?: SkyUniforms;
}
