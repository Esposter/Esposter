<script setup lang="ts">
import { RICKROLL_PROBE_TIMEOUT, RICKROLL_YOUTUBE_PROBE_URL } from "@/services/genshin/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { checkIsReachable } from "@/util/network/checkIsReachable";
import { GameLanguageTagMap, GameTextKey } from "genshin-text";
import { GameOpening } from "genshin-world";

// The game as it plays: its opening at once, and once its door is opened what it opens onto loading under the startup
// Loading screen, whose marks follow it, shown once that screen's white gives way. That is the world, or a rickroll in
// Its place the first time this browser opens the door; either is mounted only at the door, and the world draws no
// Frames while the opening covers it. The world's code arriving and its renderer being ready are the two steps
// Loading can see, since neither the lazy chunk nor the scene reports any finer progress; the rickroll's are its
// Mounting and its player being ready
const isLoaded = ref(false);
const isReady = ref(false);
const progress = computed(() => (Number(isLoaded.value) + Number(isReady.value)) / 2);
const isOpeningShown = ref(true);
const isDoorOpened = ref(false);
// Read as the door opens, so marking the rickroll seen once it shows does not swap it for the world mid-song
const isRickrolled = useLocalStorage(LocalStorageKey.GenshinRickrolled, false);
const isRickrolling = ref(false);
const gameText = await useGameText();
// Whether YouTube plays is asked of the reader's own network as the page loads rather than guessed from their language
// Or location, so the answer is in long before the door; a network that blocks YouTube, in mainland China or anywhere
// Else, gets Bilibili's upload, as does one that has not answered
const isYouTubeReachable = ref(false);
onMounted(async () => {
  isYouTubeReachable.value = await checkIsReachable(RICKROLL_YOUTUBE_PROBE_URL, RICKROLL_PROBE_TIMEOUT);
});
</script>

<template>
  <div size-full relative of-hidden>
    <ClientOnly>
      <template v-if="isDoorOpened">
        <LazyGenshinRickroll
          v-if="isRickrolling"
          :is-shown="!isOpeningShown || undefined"
          :is-you-tube-reachable="isYouTubeReachable || undefined"
          @load="isLoaded = true"
          @ready="isReady = true"
        />
        <LazyGenshinWorld
          v-else
          :is-paused="isOpeningShown || undefined"
          @load="isLoaded = true"
          @ready="isReady = true"
        />
      </template>
    </ClientOnly>
    <div v-if="isOpeningShown" :lang="GameLanguageTagMap[gameText.language]" inset-0 absolute z-1>
      <GameOpening
        :game-text="gameText.text"
        :language="gameText.language"
        :progress
        @begin="
          isRickrolling = !isRickrolled;
          isDoorOpened = true;
        "
        @finish="
          isOpeningShown = false;
          if (isRickrolling) isRickrolled = true;
        "
      />
      <!-- What loads is shown by no words of the startup screen's, so it is announced to a screen reader alone -->
      <p role="status" sr-only>
        {{ gameText.text[isReady ? GameTextKey.Ready : GameTextKey.Loading] }}
      </p>
    </div>
  </div>
</template>
