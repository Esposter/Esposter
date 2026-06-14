<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { RoutePath } from "@esposter/shared";

const callStore = useCallStore();
const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
const returnToCall = async () => {
  isPoppedOut.value = false;
  await navigateTo(
    callRoomId.value ? RoutePath.Messages(callRoomId.value) : RoutePath.Calls(activeCallSessionId.value),
  );
};
</script>

<template>
  <div pb-2 flex shrink-0 justify-center>
    <StyledCard px-3 py-1 rd-full flex gap-x-1 items-center>
      <MessageContentCallAudioMuteButton />
      <MessageContentCallCameraButton />
      <MessageContentCallControlActionButton
        icon="mdi-arrow-expand"
        tooltip="Return to Call"
        variant="plain"
        @click="returnToCall()"
      />
      <MessageContentCallControlLeaveButton />
    </StyledCard>
  </div>
</template>
