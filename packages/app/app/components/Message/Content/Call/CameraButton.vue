<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useCallMediaStore } from "@/store/message/room/call/media";

const callStore = useCallStore();
const { toggleCamera } = callStore;
const mediaStore = useCallMediaStore();
const { isCameraEnabled } = storeToRefs(mediaStore);
</script>

<template>
  <MessageContentCallActionButton
    :color="isCameraEnabled ? undefined : 'error'"
    :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'"
    :tooltip="isCameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'"
    variant="plain"
    @click="toggleCamera()"
  />
</template>
