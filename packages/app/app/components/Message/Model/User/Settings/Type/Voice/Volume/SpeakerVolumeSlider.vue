<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";

interface SpeakerVolumeSliderProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<SpeakerVolumeSliderProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: speakerVolumePercentage } = useCloned(() => userSettings.speakerVolumePercentage);
</script>

<template>
  <MessageModelUserSettingsTypeVoiceVolumeSlider
    v-model="speakerVolumePercentage"
    label="Speaker Volume"
    @end="updateUserSettings({ speakerVolumePercentage: $event })"
  />
</template>
