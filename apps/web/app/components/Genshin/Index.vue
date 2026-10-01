<script setup lang="ts">
import { GameLanguageTagMap, GameTextKey } from "genshin-text";
import { GameOpening } from "genshin-world";

// The game as it plays: its opening at once, over the world loading behind it, the login screen's flight following
// That loading, and the world once the opening's white has held. The world's code arriving and its first frame are
// The two steps loading can see, since neither the lazy chunk nor the scene reports any finer progress
const isWorldLoaded = ref(false);
const isWorldReady = ref(false);
const progress = computed(() => (Number(isWorldLoaded.value) + Number(isWorldReady.value)) / 2);
const isOpeningShown = ref(true);
const gameText = await useGameText();
// For now the door opens onto a rickroll: the white the door fades into holds a while, then the video plays
const isRickrollStarted = ref(false);
const isRickrollShown = ref(false);
const { start: startRickroll } = useTimeoutFn(
  () => {
    isRickrollShown.value = true;
  },
  Temporal.Duration.from({ seconds: 3 }).total("milliseconds"),
  { immediate: false },
);
</script>

<template>
  <div v-if="isRickrollStarted" bg-white size-full>
    <!-- YouTube's player refuses to play without the embedding page's origin, which nuxt-security's no-referrer -->
    <!-- Policy withholds -->
    <iframe
      v-if="isRickrollShown"
      src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
      title="Never Gonna Give You Up"
      allow="autoplay; encrypted-media"
      b-none
      size-full
      referrerpolicy="strict-origin-when-cross-origin"
    />
  </div>
  <div v-else size-full relative of-hidden>
    <ClientOnly>
      <LazyGenshinWorld @load="isWorldLoaded = true" @ready="isWorldReady = true" />
    </ClientOnly>
    <div v-if="isOpeningShown" inset-0 absolute z-1>
      <GameOpening
        :progress
        @begin="
          isRickrollStarted = true;
          startRickroll();
        "
        @finish="isOpeningShown = false"
      />
      <!-- The opening shows no words, so what is loading is announced to a screen reader alone, in the game's own -->
      <p role="status" :lang="GameLanguageTagMap[gameText.language]" sr-only>
        {{ gameText.text[isWorldReady ? GameTextKey.Ready : GameTextKey.Loading] }}
      </p>
    </div>
  </div>
</template>
