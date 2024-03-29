import { sleep } from "@/util/sleep";
import type { Scene } from "phaser";

export const useAnimateText = (
  scene: Scene,
  targetText: Ref<string>,
  text: string,
  configuration?: {
    delay?: number;
    onComplete?: () => void;
  },
) => {
  const textDelay = useTextDelay(configuration?.delay);
  let i = 0;
  scene.time.addEvent({
    delay: textDelay.value,
    repeat: text.length - 1,
    callback: async () => {
      targetText.value += text[i];
      i++;
      if (i === text.length - 1) {
        // We need this delay here to prevent the last character animations
        // from being updated after we set the text back to blank
        // It seems that we need exactly 2 ticks for it to finish
        await sleep(textDelay.value * 2);
        configuration?.onComplete?.();
      }
    },
  });
};
