<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useMediaStore } from "@/store/message/room/call/media";

const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
</script>

<template>
  <div px-2 pb-2 flex shrink-0 flex-wrap gap-1 items-center justify-center>
    <MessageContentCallAudioMuteButton />
    <MessageContentCallCameraButton />
    <MessageContentCallScreenShareButton />
    <MessageContentCallAudioDeafenButton />
    <MessageContentCallControlHandButton />
    <UiIconButton :meaning="UiIconMeaning.Expand" label="Return to Call" @click="isPoppedOut = false" />
    <MessageContentCallControlLeaveButton />
  </div>
</template>
