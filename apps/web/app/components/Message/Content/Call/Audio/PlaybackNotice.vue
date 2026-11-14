<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiToken } from "@/models/ui/UiToken";
import { useRealtimeStore } from "@/store/message/room/realtime";

const realtimeStore = useRealtimeStore();
const { startAudio } = realtimeStore;
const { isAudioPlaybackBlocked } = storeToRefs(realtimeStore);
</script>

<!-- The call is up but silent until the reader presses the button: the press is the gesture the browser waits for -->
<template>
  <UiAlert v-if="isAudioPlaybackBlocked" :status="UiToken.Warning">
    <div flex gap-2 items-center justify-between>
      <span>Your browser is keeping the call quiet until you allow its sound.</span>
      <UiButton :variant="UiButtonVariant.Accent" @click="startAudio()">Play sound</UiButton>
    </div>
  </UiAlert>
</template>
