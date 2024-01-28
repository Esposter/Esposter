import { dayjs } from "@/services/dayjs";
import { sleep } from "@/util/sleep";
import { type Scene } from "phaser";

export const animateText = (
  scene: Scene,
  targetText: Ref<string>,
  text: string,
  configuration?: {
    delay?: number;
    onComplete?: () => void;
  },
) => {
  const delay = configuration?.delay ?? dayjs.duration(25, "milliseconds").asMilliseconds();
  let i = 0;
  scene.time.addEvent({
    delay,
    repeat: text.length - 1,
    callback: async () => {
      targetText.value += text[i];
      i++;
      if (i === text.length - 1) {
        // We need this delay here to prevent the last character animation
        // from being updated after we set the text back to blank
        await sleep(delay);
        configuration?.onComplete?.();
      }
    },
  });
};
