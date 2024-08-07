import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { OnComplete } from "@/models/shared/OnComplete";

import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useAnimateText = (
  scene: SceneWithPlugins,
  targetText: Ref<string>,
  text: string,
  configuration?: {
    delay?: number;
    onComplete?: OnComplete;
  },
) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const { play, stop } = getDungeonsSoundEffect(scene, SoundEffectKey.TextBlip, { loop: true });
  const textDelay = useTextDelay(configuration?.delay);
  const textSections = text.split(/(\S|\s+)/).filter(Boolean);
  let i = 0;

  if (!isSkipAnimations.value) play();
  scene.time.addEvent({
    callback: async () => {
      const textSection = textSections[i];
      targetText.value += textSection;
      i++;

      if (i === textSections.length) {
        if (!isSkipAnimations.value) stop();
        // Run the hook after vue's rendering cycle has caught up with phaser
        await nextTick();
        await configuration?.onComplete?.();
      }
    },
    delay: textDelay.value,
    repeat: textSections.length - 1,
  });
};
