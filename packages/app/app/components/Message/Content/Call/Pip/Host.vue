<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

const { close, open, pipWindow } = useDocumentPictureInPicture({ height: 320, width: 420 });
const callStore = useCallStore();
const { isInCall } = storeToRefs(callStore);
const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
watch(isPoppedOut, async (newIsPoppedOut) => {
  if (newIsPoppedOut) await open();
  else close();
});
// User closed the OS window directly: keep intent in sync with the actual window.
watch(pipWindow, (newPipWindow) => {
  if (!newPipWindow) isPoppedOut.value = false;
});
// Leaving the call (intent, moderation, or session loss) must not leave an orphaned window.
watch(isInCall, (newIsInCall) => {
  if (!newIsInCall) isPoppedOut.value = false;
});
</script>

<template>
  <Teleport v-if="pipWindow" :to="pipWindow.document.body">
    <MessageContentCallPipView />
  </Teleport>
</template>
