import type { LoginInterfaceClips } from "#src/models/login/LoginInterfaceClips";
import type { MaybeRefOrGetter, ShallowRef } from "vue";

import { LoginInterfaceClip } from "#src/models/login/LoginInterfaceClip";
import { LoginStage } from "#src/models/login/LoginStage";
import { createLoginInterfaceClipMap } from "#src/services/login/interface/createLoginInterfaceClipMap";
import { playInterfaceClip } from "genshin-interface";
import { computed, nextTick, onMounted, ref, toValue, watch } from "vue";

interface Options {
  // The page's clips as the fit sampled them, which the screen plays at each stage
  interfaceClips: LoginInterfaceClips;
  // The page the clips play on, each piece they move named by its path under the game's page
  page: Readonly<ShallowRef<HTMLElement | null>>;
  // Called once the page has faded into white as it enters, which hands the screen on
  onWhiten: () => void;
  stage: MaybeRefOrGetter<LoginStage>;
}

// The login interface's clips, played as its stage changes, and whether its title is still drawn while it fades out
export const useLoginStageClips = ({ interfaceClips, onWhiten, page, stage }: Options) => {
  // Whether the title is still fading out after its click, which keeps it drawn until the fade has run
  const isStartLeaving = ref(false);
  const isStartShown = computed(() => toValue(stage) === LoginStage.Title || isStartLeaving.value);
  // The game's own clips made playable once, the white the scene fades up out of among them
  const clipMap = createLoginInterfaceClipMap(interfaceClips);
  const playClip = (clip: LoginInterfaceClip): Animation[] =>
    page.value ? playInterfaceClip(page.value, clipMap[clip]) : [];
  // Each stage's clips as the game plays them: the white curtain then the page fading in on arriving, the title fading
  // In at the title and out on its click, and the page fading into white on entering. A clip's tracks share its length,
  // So any one of them ending is the clip's end
  const playStageClips = (newStage: LoginStage, oldStage?: LoginStage): void => {
    if (oldStage === LoginStage.Title) {
      const [startFadeOut] = playClip(LoginInterfaceClip.StartFadeOut);
      if (startFadeOut) startFadeOut.addEventListener("finish", () => (isStartLeaving.value = false), { once: true });
      else isStartLeaving.value = false;
    }

    if (newStage === LoginStage.Arriving) {
      playClip(LoginInterfaceClip.WhiteCurtain);
      playClip(LoginInterfaceClip.FadeIn);
    } else if (newStage === LoginStage.Title) playClip(LoginInterfaceClip.StartFadeIn);
    else if (newStage === LoginStage.Entering) {
      const [fadeOut] = playClip(LoginInterfaceClip.FadeOut);
      if (fadeOut) fadeOut.addEventListener("finish", () => onWhiten(), { once: true });
      else onWhiten();
    }
  };
  onMounted(() => playStageClips(toValue(stage)));
  watch(
    () => toValue(stage),
    async (newStage, oldStage) => {
      // The title is kept before the new stage's render would drop it, and the clips play once that render is drawn
      if (oldStage === LoginStage.Title) isStartLeaving.value = true;
      await nextTick();
      playStageClips(newStage, oldStage);
    },
  );

  return { isStartShown };
};
