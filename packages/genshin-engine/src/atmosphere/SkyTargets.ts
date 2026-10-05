import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { LightUniforms } from "#src/nodes/LightUniforms";
import type { FogUniforms } from "#src/post/FogUniforms";
import type { PostUniforms } from "#src/post/PostUniforms";
import type { DirectionalLight, HemisphereLight } from "three";

// Everything the sky lights: the sun light and, where a scene draws god rays, the unlit sun they read, which both stand
// This far from their targets, the ambient hemisphere, and the uniforms of the materials, the fog, the post chain and the sky itself
export interface SkyTargets {
  fogUniforms: FogUniforms;
  godraysLight?: DirectionalLight;
  hemisphere: HemisphereLight;
  light: DirectionalLight;
  lightDistance: number;
  lightUniforms: LightUniforms;
  postUniforms: PostUniforms;
  skyUniforms: SkyUniforms;
}
