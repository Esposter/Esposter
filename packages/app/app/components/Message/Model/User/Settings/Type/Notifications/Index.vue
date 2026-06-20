<script setup lang="ts">
import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_AUTO_IDLE_THRESHOLD_MS, MIN_AUTO_IDLE_THRESHOLD_MS } from "@esposter/db-schema";

const MS_PER_MINUTE = 60_000;
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const { updateUserSettings } = userSettingsStore;
const autoIdleThresholdMinutes = ref(0);
watchEffect(() => {
  if (userSettings.value) autoIdleThresholdMinutes.value = userSettings.value.autoIdleThresholdMs / MS_PER_MINUTE;
});
const saveAutoIdleThreshold = (minutes: number) => updateUserSettings({ autoIdleThresholdMs: minutes * MS_PER_MINUTE });
</script>

<template>
  <v-container v-if="userSettings" fluid>
    <div font-bold mb-4 text-title-medium>Notifications</div>
    <div mb-2 text-body-medium>Idle timeout: {{ autoIdleThresholdMinutes }} min</div>
    <v-slider
      v-model="autoIdleThresholdMinutes"
      :max="MAX_AUTO_IDLE_THRESHOLD_MS / MS_PER_MINUTE"
      :min="MIN_AUTO_IDLE_THRESHOLD_MS / MS_PER_MINUTE"
      :step="1"
      hide-details
      @end="saveAutoIdleThreshold"
    />
  </v-container>
</template>
