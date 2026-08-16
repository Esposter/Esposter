<script setup lang="ts">
import type { VBtn } from "vuetify/components";

interface MediaControlsProps {
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
}

const { isCameraEnabled, isMicrophoneEnabled } = defineProps<MediaControlsProps>();
const emit = defineEmits<{ toggleCamera: []; toggleMicrophone: [] }>();
const microphoneButtonProps = computed<VBtn["$props"]>(() => ({
  color: isMicrophoneEnabled ? undefined : "error",
  size: "large",
  variant: "tonal",
}));
const cameraButtonProps = computed<VBtn["$props"]>(() => ({
  color: isCameraEnabled ? undefined : "error",
  size: "large",
  variant: "tonal",
}));
</script>

<template>
  <div flex gap-x-3 justify-center>
    <StyledTooltipIconButton
      :button-props="microphoneButtonProps"
      :icon="isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off'"
      :text="isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'"
      @click="emit('toggleMicrophone')"
    />
    <StyledTooltipIconButton
      :button-props="cameraButtonProps"
      :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'"
      :text="isCameraEnabled ? 'Turn off camera' : 'Turn on camera'"
      @click="emit('toggleCamera')"
    />
  </div>
</template>
