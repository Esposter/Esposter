<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { VoiceInputModeLabelMap } from "@/services/message/user/settings/VoiceInputModeLabelMap";
import { useUserSettingsStore } from "@/store/message/user/settings";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { VoiceInputMode, VoiceInputModes } from "@esposter/db-schema";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
</script>

<template>
  <div flex flex-col gap-y-2>
    <v-radio-group
      :model-value="userSettings.voiceInputMode"
      @update:model-value="updateUserSettings({ voiceInputMode: $event as VoiceInputMode })"
    >
      <v-radio
        v-for="voiceInputMode of VoiceInputModes"
        :key="voiceInputMode"
        :label="VoiceInputModeLabelMap[voiceInputMode]"
        :value="voiceInputMode"
      />
    </v-radio-group>
    <template v-if="userSettings.voiceInputMode === VoiceInputMode.PushToTalk">
      <MessageModelUserSettingsTypeVoicePushToTalkKeybindButton :keybind="userSettings.pushToTalkKeybind" />
      <div op-medium-emphasis text-body-small>
        Activates your mic only while you hold the keybind. Push to Talk only works while an app window (main or
        pop-out) has focus.
      </div>
      <MessageModelUserSettingsTypeVoicePushToTalkReleaseDelaySlider :user-settings />
    </template>
  </div>
</template>
