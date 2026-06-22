<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";

interface InputSensitivityProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<InputSensitivityProps>();
const { audioInputs, ensurePermissions, permissionGranted } = useDevicesList({ requestPermissions: false });
const hasInputDevice = computed(() => permissionGranted.value && audioInputs.value.length > 0);
</script>

<template>
  <div mb-3 op-medium-emphasis text-body-small>
    Controls how much sound {{ MESSAGE_DISPLAY_NAME }} transmits from your mic.
  </div>
  <MessageModelUserSettingsTypeVoiceInputSensitivityThresholdSlider v-if="hasInputDevice" :user-settings />
  <MessageModelUserSettingsTypeVoiceInputSensitivityNoDeviceWarning v-else @grant="ensurePermissions" />
</template>
