import type { PostPipeline, PostPipelineOptions, QualityTier, SkyUniforms } from "genshin-engine";
import type { MaybeRefOrGetter } from "vue";

import { SceneContextKey } from "#src/services/scene/SceneContextKey";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { isWebGPURenderer, useLoop, useTres } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import { AntialiasingMode, createPostPipeline, QualityTierSettingsMap } from "genshin-engine";

// The engine's post chain draws each frame in place of TresJS's plain render of the scene. The camera registers after
// The canvas mounts, so the chain is built once the camera exists, and rebuilt only when the camera or the tier
// Changes. Called from a component inside the canvas, whose context it reads. The chain is handed back so the tuning
// Panel reaches its passes. Under the witness render the chain resolves edges without a temporal history, and a host
// That asks is handed what it renders with
export const usePostPipeline = (
  qualityTier: MaybeRefOrGetter<QualityTier>,
  postInputs: Pick<
    PostPipelineOptions,
    "fogUniforms" | "godraysLight" | "gradeLutTexture" | "isBloomed" | "postUniforms"
  >,
  // The sky the scene draws, handed on with what it renders with
  sky?: SkyUniforms,
) => {
  const { camera, renderer, scene } = useTres();
  /* oxlint-disable no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see */
  const witness = inject(SceneWitnessKey, null);
  const sceneContext = inject(SceneContextKey, null);
  /* oxlint-enable no-restricted-globals */
  const { render } = useLoop();
  const postPipeline = shallowRef<PostPipeline>();

  watchImmediate([() => camera.value, () => toValue(qualityTier)], ([activeCamera, newQualityTier]) => {
    postPipeline.value?.renderPipeline.dispose();
    postPipeline.value =
      activeCamera && isWebGPURenderer(renderer)
        ? createPostPipeline({
            ...postInputs,
            camera: activeCamera,
            // The witness settles a view in one frame, which a temporal resolve's history and jitter cannot
            qualityTierSettings: witness
              ? { ...QualityTierSettingsMap[newQualityTier], antialiasingMode: AntialiasingMode.Smaa }
              : QualityTierSettingsMap[newQualityTier],
            renderer,
            scene: scene.value,
          })
        : undefined;
    if (sceneContext && activeCamera && isWebGPURenderer(renderer))
      sceneContext.value = { camera: activeCamera, fog: postInputs.fogUniforms, renderer, scene: scene.value, sky };
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
