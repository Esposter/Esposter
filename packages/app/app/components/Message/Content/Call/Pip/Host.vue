<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { RoutePath } from "@esposter/shared";

const { close, open, pipWindow } = useDocumentPictureInPicture({ height: 320, width: 420 });
const callStore = useCallStore();
const { activeCallSessionId, callRoomId, isInCall } = storeToRefs(callStore);
const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
const callRoute = computed(() =>
  callRoomId.value ? RoutePath.Messages(callRoomId.value) : RoutePath.Calls(activeCallSessionId.value),
);

watch(isPoppedOut, async (newIsPoppedOut) => {
  if (newIsPoppedOut) await open();
  else close();
});
// Window closed (native "Back to tab", expand button, or programmatic): sync intent and, if the
// Call is still active, surface it on the main tab so a docked call is never left invisible.
watch(pipWindow, async (newPipWindow) => {
  if (newPipWindow) return;
  const wasInCall = isInCall.value;
  isPoppedOut.value = false;
  if (wasInCall) await navigateTo(callRoute.value);
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
