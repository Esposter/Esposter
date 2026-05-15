<script setup lang="ts">
interface MediaControlsProps {
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
}

const { isCameraEnabled, isMicrophoneEnabled } = defineProps<MediaControlsProps>();
const emit = defineEmits<{ toggleCamera: []; toggleMicrophone: [] }>();
</script>

<template>
  <div flex gap-x-3>
    <v-tooltip :text="isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          :="tooltipProps"
          :color="isMicrophoneEnabled ? undefined : 'error'"
          :icon="isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off'"
          size="large"
          variant="tonal"
          @click="emit('toggleMicrophone')"
        />
      </template>
    </v-tooltip>
    <v-tooltip :text="isCameraEnabled ? 'Turn off camera' : 'Turn on camera'">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          :="tooltipProps"
          :color="isCameraEnabled ? undefined : 'error'"
          :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'"
          size="large"
          variant="tonal"
          @click="emit('toggleCamera')"
        />
      </template>
    </v-tooltip>
  </div>
</template>
