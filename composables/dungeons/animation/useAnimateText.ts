import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const useAnimateText = (
  scene: SceneWithPlugins,
  targetText: Ref<string>,
  text: string,
  configuration?: {
    delay?: number;
    onComplete?: () => void;
  },
) => {
  const { play, stop } = useDungeonsSound(scene, SoundEffectKey.TextBlip, { loop: true });
  const textDelay = useTextDelay(configuration?.delay);
  const textSections = text.split(/(\S|\s+)/).filter(Boolean);
  let i = 0;

  play();
  scene.time.addEvent({
    delay: textDelay.value,
    repeat: textSections.length - 1,
    callback: () => {
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
