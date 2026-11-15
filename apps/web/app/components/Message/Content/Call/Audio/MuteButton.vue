<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";

const callStore = useCallStore();
const { isMuted } = storeToRefs(callStore);
const { toggleMute } = callStore;
</script>

<template>
  <UiIconButton
    :meaning="isMuted ? UiIconMeaning.MicrophoneOff : UiIconMeaning.Microphone"
    :label="isMuted ? 'Unmute' : 'Mute'"
    :variant="isMuted ? UiButtonVariant.Danger : undefined"
    @click="toggleMute()"
  />
</template>
