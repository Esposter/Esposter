<script setup lang="ts">
import type { SplashTiming } from "#src/models/interface/splash/SplashTiming";
import type { Component } from "vue";

import HealthNotice from "#src/components/interface/splash/HealthNotice.vue";
import PublisherSplash from "#src/components/interface/splash/PublisherSplash.vue";
import TitleSplash from "#src/components/interface/splash/TitleSplash.vue";
import {
  HEALTH_NOTICE_TIMING,
  PUBLISHER_SPLASH_TIMING,
  TITLE_SPLASH_TIMING,
} from "#src/services/interface/splash/constants";

const emit = defineEmits<{ finish: [] }>();
// The game's opening on white, one splash after another: the publisher's logo, the game's, then the health notice,
// Each fading in, holding and fading out as the game's does, with the white it leaves held before the next. `finish`
// Says the last white has held and the login screen may fade up out of it
const splashes: { component: Component; timing: SplashTiming }[] = [
  { component: PublisherSplash, timing: PUBLISHER_SPLASH_TIMING },
  { component: TitleSplash, timing: TITLE_SPLASH_TIMING },
  { component: HealthNotice, timing: HEALTH_NOTICE_TIMING },
];
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
      <component :is="splash?.component" />
    </div>
  </div>
</template>

<style scoped>
.splash-sequence {
  position: absolute;
  inset: 0;
  background: #fff;
}

.stage {
  position: absolute;
  inset: 0;
  opacity: 0;
}
</style>
