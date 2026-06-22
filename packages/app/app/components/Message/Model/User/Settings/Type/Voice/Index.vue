<script setup lang="ts">
import { VoiceSettingsSection } from "@/models/message/user/settings/VoiceSettingsSection";
import { useUserSettingsStore } from "@/store/message/user/settings";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <template v-if="userSettings">
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.InputMode">
      <MessageModelUserSettingsTypeVoiceInputMode :user-settings />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.InputSensitivity">
      <MessageModelUserSettingsTypeVoiceInputSensitivitySlider :user-settings />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.Devices">
      <MessageModelUserSettingsTypeVoiceDeviceSelectList />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.JoinSettings">
      <MessageModelUserSettingsTypeVoiceJoinSwitches :user-settings />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.DefaultVolume">
      <MessageModelUserSettingsTypeVoiceDefaultVolumeSlider :user-settings />
    </MessageModelUserSettingsSection>
  </template>
</template>
