import type { PostPipeline } from "genshin-engine";
import type { Ref } from "vue";

import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { getResultAsync, noop } from "@esposter/shared";
import { useTres } from "@tresjs/core";
import { whenever } from "@vueuse/core";

interface SceneReadyOptions {
  // Whether the world is paused under a cover, its canvas drawing only the frames it is asked for
  getIsPaused: () => boolean;
  // Whether the regions in reach of the view have arrived, with their grounds
  isRegionDataSettled: Ref<boolean>;
  onReady: () => void;
  postPipeline: Ref<PostPipeline | undefined>;
}

// The world is ready once the ground of its first view and the regions in reach of it have arrived, so what shows it
// Never shows the bare water under a ground still streaming in. The settle function is handed back for the terrain's ready
// Event to call
export const useSceneReady = ({ getIsPaused, isRegionDataSettled, onReady, postPipeline }: SceneReadyOptions) => {
  const { advance } = useTres();
  const isTerrainSettled = ref(false);
  whenever(
    () => isTerrainSettled.value && isRegionDataSettled.value,
    async () => {
      // The view's pipelines, outlines included, compile before the world shows, so its first frame builds none. A compile
      // That fails is logged and the world shows anyway, drawn without the warm-up, rather than never being ready
      await getResultAsync(async () => {
        if (!postPipeline.value) return;
        const compiled = postPipeline.value.compileAsync();
        // The compile waits on the next frame, and a world paused under the opening draws only the frames it is asked for,
        // So a paused world asks for that frame; a running world draws it anyway, and its canvas refuses `advance`
        if (getIsPaused()) advance();
        await measureLoadStep("compile", compiled);
      }).match(noop, (error) => {
        console.error("The Windrise post pipeline failed to compile", error);
      });
      onReady();
    },
    { once: true },
  );
  return () => {
    isTerrainSettled.value = true;
  };
};
