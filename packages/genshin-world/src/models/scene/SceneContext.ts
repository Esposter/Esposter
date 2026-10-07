import type { FogUniforms, SkyUniforms } from "genshin-engine";
import type { Camera, Matrix3, Scene } from "three";
import type { Renderer, UniformNode } from "three/webgpu";

// What a scene renders with, which it hands a host that asks: the parity page's tools read its targets, its frame's
// Draw calls and its pipelines from the renderer rather than the page, its sky's sun and moon, which a sky's colours
// Are solved under, its fog's, which its haze is solved under, and its occlusion's reach, which the witness's occlusion
// Target draws with, none where the scene draws none
export interface SceneContext {
  camera: Camera;
  fog?: FogUniforms;
  occlusionRadius: number;
  renderer: Renderer;
  scene: Scene;
  sky?: SkyUniforms;
  // The white balance the frame passes through before the tone curve, which a light solved off a reference is taken
  // Back through
  whiteBalance: UniformNode<"mat3", Matrix3>;
}
