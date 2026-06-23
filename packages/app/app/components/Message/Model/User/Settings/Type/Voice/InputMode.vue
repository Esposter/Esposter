<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { VoiceInputModeLabelMap } from "@/services/message/user/settings/VoiceInputModeLabelMap";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { VoiceInputMode } from "@esposter/db-schema";

interface InputModeProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<InputModeProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const voiceInputModes = Object.values(VoiceInputMode);
</script>

<template>
  <v-radio-group
    :model-value="userSettings.voiceInputMode"
    hide-details
    @update:model-value="updateUserSettings({ voiceInputMode: $event as VoiceInputMode })"
  >
    <v-radio
      v-for="voiceInputMode of voiceInputModes"
      :key="voiceInputMode"
      :label="VoiceInputModeLabelMap[voiceInputMode]"
      :value="voiceInputMode"
    />
  </v-radio-group>
  <MessageModelUserSettingsTypeVoicePushToTalkKeybindButton
    v-if="userSettings.voiceInputMode === VoiceInputMode.PushToTalk"
    :keybind="userSettings.pushToTalkKeybind"
  />
</template>
