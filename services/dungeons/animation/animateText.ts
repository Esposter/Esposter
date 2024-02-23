import { DEFAULT_TEXT_DELAY } from "@/services/dungeons/animation/constants";
import { sleep } from "@/util/sleep";
import type { Scene } from "phaser";

export const animateText = (
  scene: Scene,
  targetText: Ref<string>,
  text: string,
  configuration?: {
    delay?: number;
    onComplete?: () => void;
  },
) => {
  const delay = configuration?.delay ?? DEFAULT_TEXT_DELAY;
  let i = 0;
  scene.time.addEvent({
    delay,
    repeat: text.length - 1,
    callback: async () => {
      targetText.value += text[i];
      i++;
      if (i === text.length - 1) {
        // We need this delay here to prevent the last character animations
        // from being updated after we set the text back to blank
        // It seems that we need exactly 2 ticks for it to finish
        await sleep(delay * 2);
        configuration?.onComplete?.();
      }
    },
  });
};
