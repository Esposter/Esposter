<script setup lang="ts">
import { RICKROLL_PROBE_TIMEOUT, RICKROLL_YOUTUBE_PROBE_URL } from "@/services/genshin/constants";
import { checkIsReachable } from "@/util/network/checkIsReachable";
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
// For now the door opens onto a rickroll: the white the door fades into holds a while, then the video plays. Whether
// YouTube plays is asked of the reader's own network as the page loads rather than guessed from their language or
// Location, so the answer is in long before the door and every reader's player starts as the white ends; a network
// That blocks YouTube, in mainland China or anywhere else, gets Bilibili's upload, as does one that has not answered
const isYouTubeReachable = ref(false);
const isRickrollStarted = ref(false);
onMounted(async () => {
  isYouTubeReachable.value = await checkIsReachable(RICKROLL_YOUTUBE_PROBE_URL, RICKROLL_PROBE_TIMEOUT);
});
</script>

<template>
  <GenshinRickroll v-if="isRickrollStarted" :is-you-tube-reachable="isYouTubeReachable || undefined" />
  <div v-else size-full relative of-hidden>
    <ClientOnly>
      <LazyGenshinWorld @load="isWorldLoaded = true" @ready="isWorldReady = true" />
    </ClientOnly>
    <div v-if="isOpeningShown" :lang="GameLanguageTagMap[gameText.language]" inset-0 absolute z-1>
      <GameOpening
        :game-text="gameText.text"
        :progress
        @begin="isRickrollStarted = true"
        @finish="isOpeningShown = false"
      />
      <!-- The world's loading is shown by no words of the opening's, so it is announced to a screen reader alone -->
      <p role="status" sr-only>
        {{ gameText.text[isWorldReady ? GameTextKey.Ready : GameTextKey.Loading] }}
      </p>
    </div>
  </div>
</template>
