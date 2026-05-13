<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isCameraEnabled } = storeToRefs(callStore);
const { toggleCamera } = callStore;
const onClick = async () => {
  await toggleCamera();
};
</script>

<template>
  <MessageContentCallActionButton
    :color="isCameraEnabled ? undefined : 'error'"
    :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'"
    :tooltip="isCameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'"
    variant="plain"
    @click="onClick()"
  />
</template>
