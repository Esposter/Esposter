import type { FogUniforms, SkyUniforms } from "genshin-engine";
import type { Camera, Scene } from "three";
import type { Renderer } from "three/webgpu";

// What a scene renders with, which it hands a host that asks: the parity page's tools read its targets, its frame's
// Draw calls and its pipelines from the renderer rather than the page, its sky's sun and moon, which a sky's colours
// Are solved under, and its fog's, which its haze is solved under
export interface SceneContext {
  camera: Camera;
  fog?: FogUniforms;
  renderer: Renderer;
  scene: Scene;
  sky?: SkyUniforms;
}
