<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_AUTO_IDLE_THRESHOLD_MS, MIN_AUTO_IDLE_THRESHOLD_MS } from "@esposter/db-schema";

interface IdleTimeoutSliderProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<IdleTimeoutSliderProps>();
const MS_PER_MINUTE = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: editedAutoIdleThresholdMinutes } = useCloned(() => userSettings.autoIdleThresholdMs / MS_PER_MINUTE);
</script>

<template>
  <div mb-2 text-body-medium>{{ editedAutoIdleThresholdMinutes }} min</div>
  <v-slider
    v-model="editedAutoIdleThresholdMinutes"
    :max="MAX_AUTO_IDLE_THRESHOLD_MS / MS_PER_MINUTE"
    :min="MIN_AUTO_IDLE_THRESHOLD_MS / MS_PER_MINUTE"
    :step="1"
    @end="(minutes) => updateUserSettings({ autoIdleThresholdMs: minutes * MS_PER_MINUTE })"
  />
</template>
