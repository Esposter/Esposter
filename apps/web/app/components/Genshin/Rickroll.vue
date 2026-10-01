<script setup lang="ts">
import {
  RICKROLL_BILIBILI_URL,
  RICKROLL_DELAY,
  RICKROLL_YOUTUBE_ORIGIN,
  RICKROLL_YOUTUBE_URL,
} from "@/services/genshin/constants";

interface Props {
  // Whether the reader's network answered YouTube as the page loaded
  isYouTubeReachable?: true;
}

const { isYouTubeReachable } = defineProps<Props>();
// What the login's door opens onto for now: white, then Rick Astley. A browser lets a frame play with sound only for a
// Few seconds after a click, so YouTube's player is mounted at once, hidden under the white, and is told to play the
// Moment the white ends, already loaded; mounted only then, its load ran past that window and it played muted.
// Bilibili's player takes no command, so it mounts as the white ends and plays itself
const player = useTemplateRef("player");
const isShown = ref(false);
const isYouTubeReady = ref(false);
const sendYouTubeCommand = (data: object) => {
  player.value?.contentWindow?.postMessage(JSON.stringify(data), RICKROLL_YOUTUBE_ORIGIN);
};
const playYouTube = () => {
  if (!isShown.value || !isYouTubeReady.value) return;
  sendYouTubeCommand({ args: [], event: "command", func: "playVideo" });
};
// Whatever the player sends once it has heard the page listening says its commands are taken
useEventListener(window, "message", (event: MessageEvent) => {
  if (event.origin !== RICKROLL_YOUTUBE_ORIGIN || isYouTubeReady.value) return;
  isYouTubeReady.value = true;
  playYouTube();
});
useTimeoutFn(() => {
  isShown.value = true;
  playYouTube();
}, RICKROLL_DELAY.total("milliseconds"));
</script>

<template>
  <div bg-white size-full>
    <!-- Either player refuses to play without the embedding page's origin, which nuxt-security's no-referrer policy -->
    <!-- Withholds -->
    <iframe
      v-if="isYouTubeReachable"
      ref="player"
      :class="{ invisible: !isShown }"
      :src="RICKROLL_YOUTUBE_URL"
      title="Never Gonna Give You Up"
      allow="autoplay; encrypted-media"
      b-none
      size-full
      referrerpolicy="strict-origin-when-cross-origin"
      @load="sendYouTubeCommand({ channel: 'widget', event: 'listening', id: 1 })"
    />
    <iframe
      v-else-if="isShown"
      :src="RICKROLL_BILIBILI_URL"
      title="Never Gonna Give You Up"
      allow="autoplay; encrypted-media"
      b-none
      size-full
      referrerpolicy="strict-origin-when-cross-origin"
    />
  </div>
</template>
