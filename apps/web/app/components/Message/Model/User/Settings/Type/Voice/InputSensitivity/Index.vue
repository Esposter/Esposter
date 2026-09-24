<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const { audioInputs, ensurePermissions, permissionGranted } = useDevicesList({ requestPermissions: false });
</script>

<template>
  <p text-muted>Controls how much sound {{ MESSAGE_DISPLAY_NAME }} transmits from your mic.</p>
  <MessageModelUserSettingsTypeVoiceInputSensitivityThresholdSlider
    v-if="permissionGranted && audioInputs.length > 0"
    :user-settings
  />
  <UiAlert v-else status="warning">
    <div flex gap-2 items-center>
      <span flex-1>
        You do not have any input devices enabled. Grant {{ MESSAGE_DISPLAY_NAME }} access to your microphone to observe
        input sensitivity.
      </span>
      <UiButton :variant="UiButtonVariant.Quiet" @click="ensurePermissions()">Grant access</UiButton>
    </div>
  </UiAlert>
</template>
