<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
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
        @click="isPoppedOut = false"
      />
      <MessageContentCallControlLeaveButton />
    </StyledCard>
  </div>
</template>
