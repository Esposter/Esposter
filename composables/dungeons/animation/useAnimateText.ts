import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
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
  const { play, stop } = useDungeonsSound(SoundEffectKey.TextBlip, { loop: true });
  const textDelay = useTextDelay(configuration?.delay);
  const textSections = text.split(/(\S|\s+)/).filter(Boolean);
  let i = 0;

  play();
  scene.time.addEvent({
    delay: textDelay.value,
    repeat: textSections.length - 1,
    callback: async () => {
      const textSection = textSections[i];
      targetText.value += textSection;
      i++;

      if (i === textSections.length) {
        stop();
        configuration?.onComplete?.();
      }
    },
  });
};
