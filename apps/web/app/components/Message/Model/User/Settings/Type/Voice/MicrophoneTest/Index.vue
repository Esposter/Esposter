<script setup lang="ts">
import { getInputSensitivityFraction } from "@/services/message/settings/getInputSensitivityFraction";

const { isTesting, level, start, stop } = useMicrophoneLevel();
</script>

<template>
  <div flex gap-3 items-center>
    <UiButton :aria-pressed="isTesting" @click="isTesting ? stop() : start()">
      {{ isTesting ? "Stop testing" : "Test mic" }}
    </UiButton>
    <!-- Always drawn, empty until a test starts, so the row does not jump when it does -->
    <UiMeter
      :high="100"
      label="Microphone test level"
      :low="100"
      :value="isTesting ? getInputSensitivityFraction(level) * 100 : 0"
      :value-text="`${Math.round(level)} dB`"
      flex-1
    />
  </div>
</template>
