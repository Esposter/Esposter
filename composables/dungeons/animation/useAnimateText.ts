import { SoundKey } from "@/models/dungeons/keys/SoundKey";
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
  const { play, stop } = useDungeonsSound(SoundKey.TextBlip, { loop: true });
  const textDelay = useTextDelay(configuration?.delay);
  let i = 0;

  play();
  scene.time.addEvent({
    delay: textDelay.value,
    repeat: text.length - 1,
    callback: async () => {
      const character = text[i];
      targetText.value += character;
      i++;
      if (i === text.length - 1) {
        stop();
        // We need this delay here to prevent the last character animations
        // from being updated after we set the text back to blank
        // It seems that we need exactly 2 ticks for it to finish
        await sleep(textDelay.value * 2);
        configuration?.onComplete?.();
      }
    },
  });
};
