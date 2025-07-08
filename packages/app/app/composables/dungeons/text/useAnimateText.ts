import type { SceneWithPlugins } from "vue-phaserjs";

import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useAnimateText = (scene: SceneWithPlugins, targetText: Ref<string>, text: string) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) return;

  const { play, stop } = getDungeonsSoundEffect(scene, SoundEffectKey.TextBlip, { loop: true });
  const textDelay = useTextDelay();
  const textSections = text.split(/(\S|\s+)/).filter(Boolean);
  let i = 0;

  play();

  return new Promise<void>((resolve) => {
    scene.time.addEvent({
      callback: async () => {
        const textSection = textSections[i];
        targetText.value += textSection;
        i++;

        if (i === textSections.length) {
          stop();
          // Resolve after vue's rendering cycle has caught up with phaser
          await nextTick();
          resolve();
        }
      },
      delay: textDelay.value,
      repeat: textSections.length - 1,
    });
  });
};
