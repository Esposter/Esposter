<script setup lang="ts">
interface MediaControlsProps {
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
}

const { isCameraEnabled, isMicrophoneEnabled } = defineProps<MediaControlsProps>();
const emit = defineEmits<{ toggleCamera: []; toggleMicrophone: [] }>();
</script>

<template>
  <div flex gap-x-3 justify-center>
    <StyledTooltipIconButton
      :button-props="{ color: isMicrophoneEnabled ? undefined : 'error', size: 'large', variant: 'tonal' }"
      :icon="isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off'"
      :text="isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'"
      @click="emit('toggleMicrophone')"
    />
    <StyledTooltipIconButton
      :button-props="{ color: isCameraEnabled ? undefined : 'error', size: 'large', variant: 'tonal' }"
      :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'"
      :text="isCameraEnabled ? 'Turn off camera' : 'Turn on camera'"
      @click="emit('toggleCamera')"
    />
  </div>
</template>
