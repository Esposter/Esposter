import type { SceneWithPlugins } from "vue-phaserjs";

import { useSkippableAnimation } from "@/composables/dungeons/animation/useSkippableAnimation";
import { typeText } from "@/composables/dungeons/text/typeText";
import { waitForTextShown } from "@/composables/dungeons/text/waitForTextShown";

export const useAnimateText = async (scene: SceneWithPlugins, targetText: Ref<string>, text: string) => {
  const textSections = text.split(/(?<token>\S|\s+)/u).filter(Boolean);

  await useSkippableAnimation(
    () => typeText(scene, targetText, textSections),
    () => {
      targetText.value = text;
    },
  );
  await waitForTextShown(scene);
};
