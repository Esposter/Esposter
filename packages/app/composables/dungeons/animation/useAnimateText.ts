import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { OnComplete } from "@/models/shared/OnComplete";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";

export const useAnimateText = (
  scene: SceneWithPlugins,
  targetText: Ref<string>,
  text: string,
  configuration?: {
    delay?: number;
    onComplete?: OnComplete;
  },
) => {
  const { play, stop } = getDungeonsSoundEffect(scene, SoundEffectKey.TextBlip, { loop: true });
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
        // Run the hook after vue's rendering cycle has caught up with phaser
        await nextTick();
        await configuration?.onComplete?.();
      }
    },
  });
};
