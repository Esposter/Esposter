<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { NoiseSuppressionModeItems } from "@/services/message/user/settings/NoiseSuppressionModeItems";
import { useUserSettingsStore } from "@/store/message/user/settings";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const items = NoiseSuppressionModeItems.map(({ subtitle, title, value }) => ({ description: subtitle, title, value }));
</script>

<template>
  <UiRadioGroup
    :model-value="userSettings.noiseSuppressionMode"
    :items
    label="Input profile"
    @update:model-value="(noiseSuppressionMode) => updateUserSettings({ noiseSuppressionMode })"
  />
</template>
