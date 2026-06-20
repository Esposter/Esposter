<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

interface InputSensitivitySliderProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<InputSensitivitySliderProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const inputSensitivityDecibels = ref(userSettings.inputSensitivityDecibels);
</script>

<template>
  <div font-bold mb-2 text-body-large>Input Sensitivity: {{ inputSensitivityDecibels }} dB</div>
  <v-slider
    v-model="inputSensitivityDecibels"
    :max="MAX_INPUT_SENSITIVITY_DECIBELS"
    :min="MIN_INPUT_SENSITIVITY_DECIBELS"
    :step="1"
    hide-details
    @end="updateUserSettings({ inputSensitivityDecibels: $event })"
  />
</template>
