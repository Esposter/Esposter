import type { FogUniforms, PostUniforms, QualityTier, SightUniforms, SkyUniforms } from "genshin-engine";
import type { Data3DTexture, Scene } from "three";

import { usePostPipeline } from "#src/composables/usePostPipeline";

interface PostChainOptions {
  fogUniforms: FogUniforms;
  getQualityTier: () => QualityTier;
  // The grade the frame is drawn through, which the scene's colours are measured under
  gradeLutTexture: Data3DTexture;
  postUniforms: PostUniforms;
  // The sight's stand-ins, drawn beside the scene and read by the post chain where the sight reaches
  sightScene: Scene;
  sightUniforms: SightUniforms;
  skyUniforms: SkyUniforms;
}

// The post chain the scene draws its frame through. No god rays and no bloom: neither is measured off a reference of Windrise,
// And drawn as they stand they veil the whole frame, the god rays marching hundreds of metres of lit air to their most opacity
// And bloom lifting the whole sky past its threshold, so the frame is drawn through the haze, the grade and the tone mapping
// Alone. No occlusion either, and the sky handed on with it as the login's is, which the parity page's tools read each pixel's
// Ray under
export const usePostChain = ({
  fogUniforms,
  getQualityTier,
  gradeLutTexture,
  postUniforms,
  sightScene,
  sightUniforms,
  skyUniforms,
}: PostChainOptions) => {
  // A developer switches TRAA off to see what its resolve costs, and the world's chain falls back to SMAA meanwhile
  const isTemporalAntialiasingOn = ref(true);
  const postPipeline = usePostPipeline(
    getQualityTier,
    {
      fogUniforms,
      gradeLutTexture,
      isBloomed: false,
      postUniforms,
      sight: { litScene: sightScene, uniforms: sightUniforms },
    },
    0,
    skyUniforms,
    undefined,
    isTemporalAntialiasingOn,
  );
  return { isTemporalAntialiasingOn, postPipeline };
};
