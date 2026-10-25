import type { SceneWithPlugins } from "vue-phaserjs";

import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { useTextDelayMs } from "@/composables/dungeons/text/useTextDelayMs";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { Scenes } from "phaser";

export const typeText = (scene: SceneWithPlugins, targetText: Ref<string>, textSections: string[]) => {
  if (textSections.length === 0) return Promise.resolve();

  const { play, stop } = getDungeonsSoundEffect(scene, SoundEffectKey.TextBlip, { loop: true });
  const textDelayMs = useTextDelayMs();
  let sectionIndex = 0;

  play();

  return new Promise<void>((resolve) => {
    // A shutdown clears the scene's clock, so the typing ends there and the blip stops rather than playing on
    const finish = () => {
      scene.events.off(Scenes.Events.SHUTDOWN, finish);
      stop();
      resolve();
    };
    scene.events.once(Scenes.Events.SHUTDOWN, finish);
    scene.time.addEvent({
      callback: () => {
        targetText.value += textSections[sectionIndex];
        sectionIndex++;

        if (sectionIndex < textSections.length) return;

        finish();
      },
      delay: textDelayMs.value,
      repeat: textSections.length - 1,
    });
  });
};
