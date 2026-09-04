<script setup lang="ts">
import type { VBtn } from "vuetify/components";

interface Props {
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
}

const { isCameraEnabled, isMicrophoneEnabled } = defineProps<Props>();
const emit = defineEmits<{ toggleCamera: []; toggleMicrophone: [] }>();
const getMediaButtonProps = (isEnabled: boolean): VBtn["$props"] => ({
  color: isEnabled ? undefined : "error",
  size: "large",
  variant: "tonal",
});
const microphoneButtonProps = computed(() => getMediaButtonProps(isMicrophoneEnabled));
const cameraButtonProps = computed(() => getMediaButtonProps(isCameraEnabled));
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
