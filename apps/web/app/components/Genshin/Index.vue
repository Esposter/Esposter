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
</script>

<template>
  <div size-full relative of-hidden>
    <ClientOnly>
      <LazyGenshinWorld @load="isWorldLoaded = true" @ready="isWorldReady = true" />
    </ClientOnly>
    <div v-if="isOpeningShown" inset-0 absolute z-1>
      <GameOpening :progress @finish="isOpeningShown = false" />
      <!-- The opening shows no words, so what is loading is announced to a screen reader alone, in the game's own -->
      <p role="status" :lang="GameLanguageTagMap[gameText.language]" sr-only>
        {{ gameText.text[isWorldReady ? GameTextKey.Ready : GameTextKey.Loading] }}
      </p>
    </div>
  </div>
</template>
