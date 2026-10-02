<script setup lang="ts">
import type { SplashTiming } from "#src/models/splash/SplashTiming";
import type { GameLanguage, GameText } from "genshin-text";
import type { Component } from "vue";

import SplashHealthNotice from "#src/components/Splash/HealthNotice/Index.vue";
import SplashPublisher from "#src/components/Splash/Publisher/Index.vue";
import SplashTitle from "#src/components/Splash/Title/Index.vue";
import { GameClient } from "#src/models/splash/GameClient";
import {
  HEALTH_NOTICE_TIMING,
  MAINLAND_HEALTH_NOTICE_TIMING,
  MAINLAND_TITLE_SPLASH_TIMING,
  PUBLISHER_SPLASH_TIMING,
  TITLE_SPLASH_TIMING,
} from "#src/services/splash/constants";
import { GameLanguageGameClientMap } from "#src/services/splash/GameLanguageGameClientMap";
import { GAME_WHITE } from "genshin-interface";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The reader's language, whose client's splashes and title logo the opening shows
  language: GameLanguage;
}

const { gameText, language } = defineProps<Props>();
const emit = defineEmits<{ finish: [] }>();
// The game's opening on white, one splash after another as the reader's client shows them: the publisher's logo, the
// Game's, then the health notice in the global client, and the game's straight away in mainland China's. Each fades
// In, holds and fades out as the game's does, with the white it leaves held before the next. `finish` says the last
// White has held and the login screen may fade up out of it
const GameClientSplashesMap: Record<
  GameClient,
  { component: Component; props?: Record<string, unknown>; timing: SplashTiming }[]
> = {
  [GameClient.Global]: [
    { component: SplashPublisher, timing: PUBLISHER_SPLASH_TIMING },
    { component: SplashTitle, props: { gameText, language }, timing: TITLE_SPLASH_TIMING },
    { component: SplashHealthNotice, props: { gameText }, timing: HEALTH_NOTICE_TIMING },
  ],
  [GameClient.Mainland]: [
    { component: SplashTitle, props: { gameText, language }, timing: MAINLAND_TITLE_SPLASH_TIMING },
    { component: SplashHealthNotice, props: { gameText }, timing: MAINLAND_HEALTH_NOTICE_TIMING },
  ],
};
const splashes = GameClientSplashesMap[GameLanguageGameClientMap[language]];
const splashIndex = ref(0);
const splash = computed(() => splashes[splashIndex.value]);
const stage = useTemplateRef("stage");
// One animation per splash, its fades and holds as offsets of one timeline, so a shot held at any moment of it shows
// That moment
const play = async (element: HTMLElement, timing: SplashTiming): Promise<void> => {
  const { fadeInEasing, fadeInMs, fadeOutEasing, fadeOutMs, holdMs, whiteAfterMs } = timing;
  const durationMs = fadeInMs + holdMs + fadeOutMs + whiteAfterMs;
  const offsetAt = (ms: number): number => ms / durationMs;
  const animation = element.animate(
    [
      { easing: fadeInEasing, offset: 0, opacity: 0 },
      { offset: offsetAt(fadeInMs), opacity: 1 },
      { easing: fadeOutEasing, offset: offsetAt(fadeInMs + holdMs), opacity: 1 },
      { offset: offsetAt(fadeInMs + holdMs + fadeOutMs), opacity: 0 },
      { offset: 1, opacity: 0 },
    ],
    { duration: durationMs, fill: "forwards" },
  );
  await animation.finished;
  if (splashIndex.value < splashes.length - 1) splashIndex.value++;
  else emit("finish");
};

watch(
  [stage, splash],
  async ([newStage, newSplash]) => {
    if (newStage && newSplash) await play(newStage, newSplash.timing);
  },
  { flush: "post" },
);
</script>

<template>
  <div class="splash-sequence">
    <div :key="splashIndex" ref="stage" class="stage">
      <component :is="splash?.component" :="splash?.props" />
    </div>
  </div>
</template>

<style scoped>
.splash-sequence {
  position: absolute;
  inset: 0;
  background: v-bind(GAME_WHITE);
}

.stage {
  position: absolute;
  inset: 0;
  opacity: 0;
}
</style>
