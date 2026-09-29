import type { MaybeRefOrGetter } from "vue";
import type { PostPipeline, PostPipelineOptions, QualityTier } from "genshin-engine";

import { isWebGPURenderer, useLoop, useTres } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import { createPostPipeline, QualityTierSettingsMap } from "genshin-engine";

// The engine's post chain draws each frame in place of TresJS's plain render of the scene. The camera registers after
// The canvas mounts, so the chain is built once the camera exists, and rebuilt only when the camera or the tier
// Changes. Called from a component inside the canvas, whose context it reads. The chain is handed back so the tuning
// Panel reaches its passes
export const usePostPipeline = (
  qualityTier: MaybeRefOrGetter<QualityTier>,
  postInputs: Pick<PostPipelineOptions, "fogUniforms" | "godraysLight" | "gradeLutTexture" | "postUniforms">,
) => {
  const { camera, renderer, scene } = useTres();
  const { render } = useLoop();
  const postPipeline = shallowRef<PostPipeline>();

  watchImmediate([() => camera.value, () => toValue(qualityTier)], ([activeCamera, newQualityTier]) => {
    postPipeline.value?.renderPipeline.dispose();
    postPipeline.value =
      activeCamera && isWebGPURenderer(renderer)
        ? createPostPipeline({
            ...postInputs,
            camera: activeCamera,
            qualityTierSettings: QualityTierSettingsMap[newQualityTier],
            renderer,
            scene: scene.value,
          })
        : undefined;
  });

  render((notifySuccess) => {
    if (!postPipeline.value) return;
    postPipeline.value.renderPipeline.render();
    notifySuccess();
  });

  onUnmounted(() => {
    postPipeline.value?.renderPipeline.dispose();
  });

  return postPipeline;
};
