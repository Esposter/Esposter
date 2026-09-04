import type { SceneWithPlugins } from "vue-phaserjs";

import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useAnimateText = (scene: SceneWithPlugins, targetText: Ref<string>, text: string) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) return undefined;

  const { play, stop } = getDungeonsSoundEffect(scene, SoundEffectKey.TextBlip, { loop: true });
  const textDelayMs = useTextDelayMs();
  const textSections = text.split(/(?<token>\S|\s+)/u).filter(Boolean);
  let sectionIndex = 0;

  play();

  return new Promise<void>((resolve) => {
    scene.time.addEvent({
      callback: async () => {
        const textSection = textSections[sectionIndex];
        targetText.value += textSection;
        sectionIndex++;

        if (sectionIndex === textSections.length) {
          stop();
          // Resolve after vue's rendering cycle has caught up with phaser
          await nextTick();
          resolve();
        }
      },
      delay: textDelayMs.value,
      repeat: textSections.length - 1,
    });
  });
};
