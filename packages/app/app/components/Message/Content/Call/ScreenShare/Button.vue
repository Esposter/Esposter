<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

const callStore = useCallStore();
const { toggleScreenShare } = callStore;
const mediaStore = useMediaStore();
const { isScreenSharing } = storeToRefs(mediaStore);
const canScreenShare = ref(false);

onMounted(() => {
  canScreenShare.value = Boolean(window.navigator.mediaDevices?.getDisplayMedia);
});
</script>

<template>
  <MessageContentCallControlActionButton
    v-if="canScreenShare"
    :color="isScreenSharing ? 'error' : undefined"
    :icon="isScreenSharing ? 'mdi-monitor-off' : 'mdi-monitor-share'"
    :tooltip="isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'"
    variant="plain"
    @click="toggleScreenShare()"
  />
</template>
