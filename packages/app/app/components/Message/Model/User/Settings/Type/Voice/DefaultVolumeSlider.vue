<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_USER_VOLUME_PERCENTAGE } from "@esposter/db-schema";

interface DefaultVolumeSliderProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<DefaultVolumeSliderProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const defaultUserVolumePercentage = ref(userSettings.defaultUserVolumePercentage);
</script>

<template>
  <div font-bold mb-2 text-body-large>Default User Volume: {{ defaultUserVolumePercentage }}%</div>
  <v-slider
    v-model="defaultUserVolumePercentage"
    :max="MAX_USER_VOLUME_PERCENTAGE"
    :min="0"
    :step="1"
    hide-details
    @end="updateUserSettings({ defaultUserVolumePercentage: $event })"
  />
</template>
