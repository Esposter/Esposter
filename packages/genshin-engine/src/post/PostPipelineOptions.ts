import type { FogUniforms } from "#src/post/FogUniforms";
import type { PostUniforms } from "#src/post/PostUniforms";
import type { QualityTierSettings } from "#src/renderer/QualityTierSettings";
import type { Camera, Data3DTexture, DirectionalLight, Scene } from "three";
import type { Renderer } from "three/webgpu";

export interface PostPipelineOptions {
  camera: Camera;
  fogUniforms: FogUniforms;
  // The unlit sun the god rays march through, where a scene draws them
  godraysLight?: DirectionalLight;
  // The grade over the display colour, where a scene grades its look; a scene whose colours are measured off references
  // Through the tone mapping alone draws none, so every measured colour inverts exactly
  gradeLutTexture?: Data3DTexture;
  // Whether the scene blooms where its tier allows, false where its colours are measured through the tone mapping alone
  isBloomed?: boolean;
  postUniforms: PostUniforms;
  qualityTierSettings: QualityTierSettings;
  renderer: Renderer;
  scene: Scene;
}
