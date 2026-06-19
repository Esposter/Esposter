<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

const { isSupported } = useDocumentPictureInPicture();
const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
</script>

<template>
  <MessageContentCallControlActionButton
    v-if="isSupported"
    :color="isPoppedOut ? 'primary' : undefined"
    icon="mdi-picture-in-picture-bottom-right"
    :tooltip="isPoppedOut ? 'Close Picture-in-Picture' : 'Picture-in-Picture'"
    variant="plain"
    @click="isPoppedOut = !isPoppedOut"
  />
</template>
