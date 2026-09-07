<script setup lang="ts">
import type { NoiseSuppressionMode, UserSettingsInMessage } from "@esposter/db-schema";

import { NoiseSuppressionModeItems } from "@/services/message/user/settings/NoiseSuppressionModeItems";
import { useUserSettingsStore } from "@/store/message/user/settings";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
</script>

<template>
  <v-radio-group
    :model-value="userSettings.noiseSuppressionMode"
    @update:model-value="updateUserSettings({ noiseSuppressionMode: $event as NoiseSuppressionMode })"
  >
    <v-radio v-for="{ subtitle, title, value } of NoiseSuppressionModeItems" :key="value" :value>
      <template #label>
        <div flex flex-col>
          <span text-body-medium>{{ title }}</span>
          <span text-hint>{{ subtitle }}</span>
        </div>
      </template>
    </v-radio>
  </v-radio-group>
</template>
