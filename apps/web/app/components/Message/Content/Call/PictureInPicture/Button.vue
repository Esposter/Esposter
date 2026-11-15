<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useMediaStore } from "#src/store/message/room/call/media";

const { isSupported } = useDocumentPictureInPicture();
const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
</script>

<template>
  <UiIconButton
    v-if="isSupported"
    :meaning="UiIconMeaning.PictureInPicture"
    :label="isPoppedOut ? 'Close Picture-in-Picture' : 'Picture-in-Picture'"
    :variant="isPoppedOut ? UiButtonVariant.Accent : undefined"
    @click="isPoppedOut = !isPoppedOut"
  />
</template>
