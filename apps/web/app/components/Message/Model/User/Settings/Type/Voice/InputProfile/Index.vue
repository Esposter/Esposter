<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { NoiseSuppressionModeItems } from "#src/services/message/user/settings/NoiseSuppressionModeItems";
import { useUserSettingsStore } from "#src/store/message/user/settings/index";

interface Props {
  userSettings: UserSettingsInMessage;
}

defineProps<Props>();
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
