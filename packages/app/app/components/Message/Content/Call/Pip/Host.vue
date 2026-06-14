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
// Window closed (native "Back to tab", expand button, or leaveCall clearing isPoppedOut): sync
// intent and, if still in the call, surface it on the main tab so a docked call is never invisible.
watch(pipWindow, async (newPipWindow) => {
  if (newPipWindow) return;
  const wasInCall = isInCall.value;
  isPoppedOut.value = false;
  if (wasInCall) await navigateTo(callRoute.value);
});
</script>

<template>
  <Teleport v-if="pipWindow" :to="pipWindow.document.body">
    <MessageContentCallPipView />
  </Teleport>
</template>
