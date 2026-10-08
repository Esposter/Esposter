import type { StoneLightUniforms } from "#src/models/nodes/StoneLightUniforms";
import type { FogUniforms } from "#src/models/post/FogUniforms";
import type { PostUniforms } from "#src/models/post/PostUniforms";
import type { SightUniforms } from "#src/models/post/SightUniforms";
import type { QualityTierSettings } from "#src/models/renderer/QualityTierSettings";
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
  // How far round each pixel in metres the scene's screen-space occlusion reaches, where a scene draws it
  occlusionRadius?: number;
  postUniforms: PostUniforms;
  qualityTierSettings: QualityTierSettings;
  renderer: Renderer;
  scene: Scene;
  // The sight, where a scene lights what it can act on: the things drawn into `litScene` in the colours they are lit in,
  // Which the scene draws beside itself, and the uniforms the sight spreads by. It is drawn after the fog, before bloom
  sight?: { litScene: Scene; uniforms: SightUniforms };
  // The stone's light, where a scene hazes its stone in colours of its own: the scene pass then writes the stone's mask
  // And the haze draws the stone under the light's haze colours in place of the rest of the scene's
  stoneLight?: StoneLightUniforms;
}
