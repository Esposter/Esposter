import type { FogUniforms } from "#src/post/FogUniforms";
import type { PostUniforms } from "#src/post/PostUniforms";
import type { QualityTierSettings } from "#src/renderer/QualityTierSettings";
import type { Camera, Data3DTexture, DirectionalLight, Scene } from "three";
import type { Renderer } from "three/webgpu";

export interface PostPipelineOptions {
  camera: Camera;
  fogUniforms: FogUniforms;
  godraysLight: DirectionalLight;
  gradeLutTexture: Data3DTexture;
  postUniforms: PostUniforms;
  qualityTierSettings: QualityTierSettings;
  renderer: Renderer;
  scene: Scene;
}
