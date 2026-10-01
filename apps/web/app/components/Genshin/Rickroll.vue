<script setup lang="ts">
import {
  RICKROLL_BILIBILI_URL,
  RICKROLL_YOUTUBE_ORIGIN,
  RICKROLL_YOUTUBE_READY_TIMEOUT,
  RICKROLL_YOUTUBE_URL,
} from "@/services/genshin/constants";

interface Props {
  // Whether the opening has finished, which the player waits on, mounted under the startup loading screen until then
  isShown?: true;
  // Whether the reader's network answered YouTube as the page loaded
  isYouTubeReachable?: true;
}

const { isShown, isYouTubeReachable } = defineProps<Props>();
const emit = defineEmits<{ load: []; ready: [] }>();
// What the login's door opens onto for now: Rick Astley, loaded under the startup loading screen the way the world
// Would be, whose marks follow it, and played as that screen's white gives way. YouTube's player loads hidden and is
// Told to play through its frame API, so it starts at once, while the door's click is still fresh enough for the
// Browser to let it play with sound. Bilibili's player takes no command, so it has nothing to load ahead and mounts as
// It is shown, playing itself
const player = useTemplateRef("player");
const isYouTubePlayed = ref(isYouTubeReachable === true);
const isYouTubeReady = ref(false);
// A network that reached YouTube's host yet whose player never answers, a blocked embed script or a player that failed
// To load, gets Bilibili's upload in its place rather than leaving the loading screen waiting on it
const { stop: stopYouTubeFallback } = useTimeoutFn(
  () => {
    isYouTubePlayed.value = false;
    emit("ready");
  },
  RICKROLL_YOUTUBE_READY_TIMEOUT.total("milliseconds"),
  { immediate: isYouTubePlayed.value },
);
const sendYouTubeCommand = (data: object) => {
  player.value?.contentWindow?.postMessage(JSON.stringify(data), RICKROLL_YOUTUBE_ORIGIN);
};
const playYouTube = () => {
  if (!isShown || !isYouTubeReady.value) return;
  sendYouTubeCommand({ args: [], event: "command", func: "playVideo" });
};
// Whatever the player sends once it has heard the page listening says its commands are taken
useEventListener(window, "message", (event: MessageEvent) => {
  if (event.origin !== RICKROLL_YOUTUBE_ORIGIN || !isYouTubePlayed.value || isYouTubeReady.value) return;
  stopYouTubeFallback();
  isYouTubeReady.value = true;
  emit("ready");
  playYouTube();
});
watch(
  () => isShown,
  () => {
    playYouTube();
  },
);
onMounted(() => {
  emit("load");
  if (!isYouTubeReachable) emit("ready");
});
</script>

<template>
  <div bg-white size-full>
    <!-- Either player refuses to play without the embedding page's origin, which nuxt-security's no-referrer policy -->
    <!-- Withholds -->
    <iframe
      v-if="isYouTubePlayed"
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
