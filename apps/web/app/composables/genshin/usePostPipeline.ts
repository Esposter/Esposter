import type { QualityTier } from "genshin-engine";
import type { RenderPipeline } from "three/webgpu";

import { isWebGPURenderer } from "@tresjs/core";
import { createPostPipeline, QualityTierSettingsMap } from "genshin-engine";

// The engine's post chain draws each frame in place of TresJS's plain render of the scene. The camera registers after
// The canvas mounts, so the chain is built once the camera exists, and rebuilt only when the camera or the tier
// Changes. Called from a component inside the canvas, whose context it reads
export const usePostPipeline = (qualityTier: MaybeRefOrGetter<QualityTier>) => {
  const { camera, renderer, scene } = useTres();
  const { render } = useLoop();
  let renderPipeline: RenderPipeline | undefined;

  watchImmediate([() => camera.value, () => toValue(qualityTier)], ([activeCamera, newQualityTier]) => {
    renderPipeline?.dispose();
    renderPipeline =
      activeCamera && isWebGPURenderer(renderer)
        ? createPostPipeline(renderer, scene.value, activeCamera, QualityTierSettingsMap[newQualityTier])
        : undefined;
  });

  render((notifySuccess) => {
    if (!renderPipeline) return;
    renderPipeline.render();
    notifySuccess();
  });

  onUnmounted(() => {
    renderPipeline?.dispose();
  });
};
