<script setup lang="ts">
const { isTesting, level, start, stop } = useMicrophoneLevel();
</script>

<template>
  <div mt-3 flex items-center gap-3>
    <v-btn
      :color="isTesting ? 'primary' : undefined"
      :prepend-icon="isTesting ? 'mdi-microphone-off' : 'mdi-microphone'"
      size="small"
      variant="tonal"
      @click="isTesting ? stop() : start()"
    >
      {{ isTesting ? "Stop Testing" : "Test Mic" }}
    </v-btn>
    <MessageModelUserSettingsTypeVoiceMicTestMeter v-if="isTesting" :level flex-1 />
  </div>
</template>
