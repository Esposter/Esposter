<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isScreenSharing } = storeToRefs(callStore);
const { toggleScreenShare } = callStore;
const canScreenShare = ref(false);

onMounted(() => {
  canScreenShare.value = Boolean(window.navigator.mediaDevices?.getDisplayMedia);
});
</script>

<template>
  <MessageContentCallActionButton
    v-if="canScreenShare"
    :color="isScreenSharing ? 'error' : undefined"
    :icon="isScreenSharing ? 'mdi-monitor-off' : 'mdi-monitor-share'"
    :tooltip="isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'"
    variant="plain"
    @click="toggleScreenShare()"
  />
</template>
