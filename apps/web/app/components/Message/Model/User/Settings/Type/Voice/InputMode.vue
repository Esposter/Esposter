<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { VoiceInputModeLabelMap } from "@/services/message/user/settings/VoiceInputModeLabelMap";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { VoiceInputMode, VoiceInputModes } from "@esposter/db-schema";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const items = VoiceInputModes.map((voiceInputMode) => ({
  title: VoiceInputModeLabelMap[voiceInputMode],
  value: voiceInputMode,
}));
</script>

<template>
  <UiRadioGroup
    :model-value="userSettings.voiceInputMode"
    :items
    label="Input mode"
    @update:model-value="(voiceInputMode) => updateUserSettings({ voiceInputMode })"
  />
  <template v-if="userSettings.voiceInputMode === VoiceInputMode.PushToTalk">
    <MessageModelUserSettingsTypeVoicePushToTalkKeybindButton :keybind="userSettings.pushToTalkKeybind" />
    <p text-muted>
      Activates your mic only while you hold the keybind. Push to Talk only works while an app window (main or pop-out)
      has focus.
    </p>
    <MessageModelUserSettingsTypeVoicePushToTalkReleaseDelaySlider :user-settings />
  </template>
</template>
