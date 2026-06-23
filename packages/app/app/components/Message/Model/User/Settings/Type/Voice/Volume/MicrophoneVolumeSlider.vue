<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";

interface MicrophoneVolumeSliderProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<MicrophoneVolumeSliderProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: microphoneVolumePercentage } = useCloned(() => userSettings.microphoneVolumePercentage);
</script>

<template>
  <MessageModelUserSettingsTypeVoiceVolumeSlider
    v-model="microphoneVolumePercentage"
    label="Microphone Volume"
    @end="updateUserSettings({ microphoneVolumePercentage: $event })"
  />
</template>
