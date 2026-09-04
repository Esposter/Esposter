<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const { audioInputs, ensurePermissions, permissionGranted } = useDevicesList({ requestPermissions: false });
</script>

<template>
  <div mb-3 text-hint>Controls how much sound {{ MESSAGE_DISPLAY_NAME }} transmits from your mic.</div>
  <MessageModelUserSettingsTypeVoiceInputSensitivityThresholdSlider
    v-if="permissionGranted && audioInputs.length > 0"
    :user-settings
  />
  <v-alert v-else density="compact" type="warning" variant="tonal">
    You do not have any input devices enabled. You must
    <StyledActionLink @click="ensurePermissions()">
      grant {{ MESSAGE_DISPLAY_NAME }} access to your microphone
    </StyledActionLink>
    in order to observe input sensitivity.
  </v-alert>
</template>
