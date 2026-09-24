<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_USER_VOLUME_PERCENTAGE } from "@esposter/db-schema";

interface Props {
  field: keyof Pick<UserSettingsInMessage, "microphoneVolumePercentage" | "speakerVolumePercentage">;
  label: string;
  userSettings: UserSettingsInMessage;
}

const { field, label, userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: editedVolumePercentage } = useCloned(() => userSettings[field]);
</script>

<template>
  <UiSlider
    v-model="editedVolumePercentage"
    :label
    :max="MAX_USER_VOLUME_PERCENTAGE"
    :min="0"
    :step="1"
    :value-text="`${editedVolumePercentage}%`"
    @end="(volumePercentage) => updateUserSettings({ [field]: volumePercentage })"
  />
</template>
