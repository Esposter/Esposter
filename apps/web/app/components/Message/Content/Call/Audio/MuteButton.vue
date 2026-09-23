<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isMuted } = storeToRefs(callStore);
const { toggleMute } = callStore;
</script>

<template>
  <MessageContentCallControlActionButton
    :color="isMuted ? 'error' : undefined"
    :icon="isMuted ? 'i-mdi:microphone-off' : 'i-mdi:microphone'"
    :tooltip="isMuted ? 'Unmute' : 'Mute'"
    variant="plain"
    @click="toggleMute()"
  />
</template>
