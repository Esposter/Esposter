<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";

interface UserVolumeSliderProps {
  field: "microphoneVolumePercentage" | "speakerVolumePercentage";
  label: string;
  userSettings: UserSettingsInMessage;
}

const { field, label, userSettings } = defineProps<UserVolumeSliderProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: editedVolumePercentage } = useCloned(() => userSettings[field]);
</script>

<template>
  <MessageModelUserSettingsTypeVoiceVolumeSlider
    v-model="editedVolumePercentage"
    :label
    @end="updateUserSettings({ [field]: $event })"
  />
</template>
