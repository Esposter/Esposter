import type { SceneWithPlugins } from "vue-phaserjs";

import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { useSkippableAnimation } from "@/composables/dungeons/animation/useSkippableAnimation";
import { useTextDelayMs } from "@/composables/dungeons/text/useTextDelayMs";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { Scenes } from "phaser";
import { onNextTick } from "vue-phaserjs";

// A text change reaches Vue's watchers on the next render, and they hand it to Phaser on the scene's next tick,
// So the text is on screen once both have run. A shutdown drops the scene's next-tick listeners unrun, so it settles too
const waitForTextShown = async (scene: SceneWithPlugins) => {
  await nextTick();
  await new Promise<void>((resolve) => {
    const settle = () => {
      scene.events.off(Scenes.Events.SHUTDOWN, settle);
      resolve();
    };
    scene.events.once(Scenes.Events.SHUTDOWN, settle);
    onNextTick(settle, scene.scene.key);
  });
};

const typeText = (scene: SceneWithPlugins, targetText: Ref<string>, textSections: string[]) => {
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
