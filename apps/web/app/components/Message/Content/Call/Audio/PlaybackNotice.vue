<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useLiveKitStore } from "@/store/message/room/liveKit";

const liveKitStore = useLiveKitStore();
const { startAudio } = liveKitStore;
const { isAudioPlaybackBlocked } = storeToRefs(liveKitStore);
</script>

<!-- The call is up but silent until the reader presses the button: the press is the gesture the browser waits for -->
<template>
  <UiAlert v-if="isAudioPlaybackBlocked" status="warning">
    <div flex gap-2 items-center justify-between>
      <span>Your browser is keeping the call quiet until you allow its sound.</span>
      <UiButton :variant="UiButtonVariant.Accent" @click="startAudio()">Play sound</UiButton>
    </div>
  </UiAlert>
</template>
