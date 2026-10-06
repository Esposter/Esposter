<script setup lang="ts">
import { GameLanguageTagMap, GameTextKey } from "genshin-text";
import { GameOpening } from "genshin-world";

// The game as it plays: its opening at once, and once its door is opened the world loading under the startup loading
// Screen, whose marks follow it, shown once that screen's white gives way. The world is mounted only at the door, and
// Draws no frames while the opening covers it, though its first view's ground still streams in. Its code arriving and
// That ground having arrived are the two steps loading can see, since neither reports any finer progress
const isLoaded = ref(false);
const isReady = ref(false);
const progress = computed(() => (Number(isLoaded.value) + Number(isReady.value)) / 2);
const isOpeningShown = ref(true);
const isDoorOpened = ref(false);
const gameText = await useGameText();
</script>

<template>
  <div size-full relative of-hidden>
    <ClientOnly>
      <LazyGenshinWorld
        v-if="isDoorOpened"
        :is-paused="isOpeningShown || undefined"
        @load="isLoaded = true"
        @ready="isReady = true"
      />
    </ClientOnly>
    <div v-if="isOpeningShown" :lang="GameLanguageTagMap[gameText.language]" inset-0 absolute z-1>
      <GameOpening
        :game-text="gameText.text"
        :language="gameText.language"
        :progress
        @begin="isDoorOpened = true"
        @finish="isOpeningShown = false"
      />
      <!-- What loads is shown by no words of the startup screen's, so it is announced to a screen reader alone -->
      <p role="status" sr-only>
        {{ gameText.text[isReady ? GameTextKey.Ready : GameTextKey.Loading] }}
      </p>
    </div>
  </div>
</template>
