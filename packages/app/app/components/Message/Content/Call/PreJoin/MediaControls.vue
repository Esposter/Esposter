<script setup lang="ts">
const props = defineProps<{ isCameraEnabled: boolean; isMicEnabled: boolean }>();
const emit = defineEmits<{ toggleCamera: []; toggleMic: [] }>();
</script>

<template>
  <div flex gap-x-3>
    <v-tooltip :text="isMicEnabled ? 'Mute microphone' : 'Unmute microphone'">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          :="tooltipProps"
          :color="isMicEnabled ? undefined : 'error'"
          :icon="isMicEnabled ? 'mdi-microphone' : 'mdi-microphone-off'"
          size="large"
          variant="tonal"
          @click="emit('toggleMic')"
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
