<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { getInputSensitivityFraction } from "@/services/message/settings/getInputSensitivityFraction";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: editedInputSensitivityDecibels } = useCloned(() => userSettings.inputSensitivityDecibels);
const { level, start } = useMicrophoneLevel();

onMounted(async () => {
  await start();
});
</script>

<template>
  <!-- Discord draws the live level inside the threshold's track, so the thumb sits where the voice has to reach -->
  <UiSlider
    v-model="editedInputSensitivityDecibels"
    is-label-hidden
    label="Input sensitivity"
    :max="MAX_INPUT_SENSITIVITY_DECIBELS"
    :min="MIN_INPUT_SENSITIVITY_DECIBELS"
    :step="1"
    :level="getInputSensitivityFraction(level)"
    :level-label="`Microphone level ${Math.round(level)} dB`"
    :value-text="`${editedInputSensitivityDecibels} dB`"
    @end="(inputSensitivityDecibels) => updateUserSettings({ inputSensitivityDecibels })"
  />
</template>
