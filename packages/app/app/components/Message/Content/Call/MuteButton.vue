<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isMuted } = storeToRefs(callStore);
const { toggleMute } = callStore;
</script>

<template>
  <MessageContentCallActionButton
    :color="isMuted ? 'error' : undefined"
    :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
    :tooltip="isMuted ? 'Unmute' : 'Mute'"
    variant="plain"
    @click="toggleMute()"
  />
</template>
