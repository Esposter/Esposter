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
  <div mb-3 text-hint>Controls how much sound {{ MESSAGE_DISPLAY_NAME }} transmits from your mic.</div>
  <MessageModelUserSettingsTypeVoiceInputSensitivityThresholdSlider v-if="hasInputDevice" :user-settings />
  <v-alert v-else density="compact" type="warning" variant="tonal">
    You do not have any input devices enabled. You must
    <span
      text-info
      underline
      cursor-pointer
      role="button"
      tabindex="0"
      @click="ensurePermissions()"
      @keydown.enter.prevent="ensurePermissions()"
    >
      grant {{ MESSAGE_DISPLAY_NAME }} access to your microphone
    </span>
    in order to observe input sensitivity.
  </v-alert>
</template>
