<script setup lang="ts">
import { GameOpening } from "genshin-world";

// The game as it plays: its opening at once, over the world loading behind it, the login screen's flight following
// That loading, and the world once the opening's white has held. The world's code arriving and its first frame are
// The two steps loading can see, since neither the lazy chunk nor the scene reports any finer progress
const isWorldLoaded = ref(false);
const isWorldReady = ref(false);
const progress = computed(() => (Number(isWorldLoaded.value) + Number(isWorldReady.value)) / 2);
const isOpeningShown = ref(true);
</script>

<template>
  <div size-full relative of-hidden>
    <ClientOnly>
      <LazyGenshinWorld @load="isWorldLoaded = true" @ready="isWorldReady = true" />
    </ClientOnly>
    <div v-if="isOpeningShown" inset-0 absolute z-1>
      <GameOpening :progress @finish="isOpeningShown = false" />
      <!-- The opening shows no words, so what is loading is announced to a screen reader alone -->
      <p role="status" sr-only>{{ isWorldReady ? "Ready" : "Loading the world…" }}</p>
    </div>
  </div>
</template>
