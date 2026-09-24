<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isMuted } = storeToRefs(callStore);
const { toggleMute } = callStore;
</script>

<template>
  <MessageContentCallControlActionButton
    :meaning="isMuted ? UiIconMeaning.MicrophoneOff : UiIconMeaning.Microphone"
    :label="isMuted ? 'Unmute' : 'Mute'"
    :variant="isMuted ? UiButtonVariant.Danger : undefined"
    @click="toggleMute()"
  />
</template>
