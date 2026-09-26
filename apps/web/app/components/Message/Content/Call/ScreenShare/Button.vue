<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

const callStore = useCallStore();
const { toggleScreenShare } = callStore;
const mediaStore = useMediaStore();
const { isScreenSharing } = storeToRefs(mediaStore);
const isScreenShareSupported = ref(false);

onMounted(() => {
  isScreenShareSupported.value = Boolean(window.navigator.mediaDevices?.getDisplayMedia);
});
</script>

<template>
  <UiIconButton
    v-if="isScreenShareSupported"
    :meaning="isScreenSharing ? UiIconMeaning.StopScreenShare : UiIconMeaning.ScreenShare"
    :label="isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'"
    :variant="isScreenSharing ? UiButtonVariant.Accent : undefined"
    @click="toggleScreenShare()"
  />
</template>
