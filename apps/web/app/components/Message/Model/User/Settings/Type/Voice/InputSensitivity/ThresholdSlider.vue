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
  <!-- Discord draws the live level inside the threshold's track; here the level runs along the same width right under
       it, so the thumb lines up with where the voice has to reach -->
  <div flex flex-col gap-2>
    <UiSlider
      v-model="editedInputSensitivityDecibels"
      is-label-hidden
      label="Input sensitivity"
      :max="MAX_INPUT_SENSITIVITY_DECIBELS"
      :min="MIN_INPUT_SENSITIVITY_DECIBELS"
      :step="1"
      :value-text="`${editedInputSensitivityDecibels} dB`"
      @end="(inputSensitivityDecibels) => updateUserSettings({ inputSensitivityDecibels })"
    />
    <!-- Only a level at the very top, where the microphone clips, turns the meter -->
    <UiMeter
      :high="100"
      label="Microphone level"
      :low="100"
      :value="getInputSensitivityFraction(level) * 100"
      :value-text="`${Math.round(level)} dB`"
    />
  </div>
</template>
