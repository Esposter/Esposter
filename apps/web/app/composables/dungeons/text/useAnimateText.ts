import type { SceneWithPlugins } from "vue-phaserjs";

import { typeText } from "#src/services/dungeons/text/typeText";
import { waitForTextShown } from "#src/services/dungeons/text/waitForTextShown";

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
