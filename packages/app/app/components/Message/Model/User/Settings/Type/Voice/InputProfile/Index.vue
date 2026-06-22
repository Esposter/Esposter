<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { NoiseSuppressionModeItems } from "@/services/message/user/settings/NoiseSuppressionModeItems";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { NoiseSuppressionMode } from "@esposter/db-schema";

interface InputProfileProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<InputProfileProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
</script>

<template>
  <v-radio-group
    :model-value="userSettings.noiseSuppressionMode"
    hide-details
    @update:model-value="updateUserSettings({ noiseSuppressionMode: $event as NoiseSuppressionMode })"
  >
    <v-radio v-for="{ subtitle, title, value } of NoiseSuppressionModeItems" :key="value" :value="value">
      <template #label>
        <div flex flex-col>
          <span text-body-medium>{{ title }}</span>
          <span op-medium-emphasis text-body-small>{{ subtitle }}</span>
        </div>
      </template>
    </v-radio>
  </v-radio-group>
</template>
