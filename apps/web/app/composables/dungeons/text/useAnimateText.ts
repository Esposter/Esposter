import type { SceneWithPlugins } from "vue-phaserjs";

import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { useSkippableAnimation } from "@/composables/dungeons/animation/useSkippableAnimation";
import { useTextDelayMs } from "@/composables/dungeons/text/useTextDelayMs";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { onNextTick } from "vue-phaserjs";

// A text change reaches Vue's watchers on the next render, and they hand it to Phaser on the scene's next tick,
// So the text is on screen once both have run
const waitForTextShown = async (scene: SceneWithPlugins) => {
  await nextTick();
  await new Promise<void>((resolve) => {
    onNextTick(() => {
      resolve();
    }, scene.scene.key);
  });
};

const typeText = (scene: SceneWithPlugins, targetText: Ref<string>, textSections: string[]) => {
  if (textSections.length === 0) return Promise.resolve();

  const { play, stop } = getDungeonsSoundEffect(scene, SoundEffectKey.TextBlip, { loop: true });
  const textDelayMs = useTextDelayMs();
  let sectionIndex = 0;

  play();

  return new Promise<void>((resolve) => {
    scene.time.addEvent({
      callback: () => {
        targetText.value += textSections[sectionIndex];
        sectionIndex++;

        if (sectionIndex < textSections.length) return;

        stop();
        resolve();
      },
      delay: textDelayMs.value,
      repeat: textSections.length - 1,
    });
  });
};

export const useAnimateText = async (scene: SceneWithPlugins, targetText: Ref<string>, text: string) => {
  const textSections = text.split(/(?<token>\S|\s+)/u).filter(Boolean);

  await useSkippableAnimation(
    () => typeText(scene, targetText, textSections),
    () => {
      targetText.value = text;
    },
  );
  await waitForTextShown(scene);
};
