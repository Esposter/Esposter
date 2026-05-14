<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

const callStore = useCallStore();
const { toggleCamera } = callStore;
const mediaStore = useMediaStore();
const { isCameraEnabled } = storeToRefs(mediaStore);
</script>

<template>
  <MessageContentCallControlActionButton
    :color="isCameraEnabled ? undefined : 'error'"
    :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'"
    :tooltip="isCameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'"
    variant="plain"
    @click="toggleCamera()"
  />
</template>
