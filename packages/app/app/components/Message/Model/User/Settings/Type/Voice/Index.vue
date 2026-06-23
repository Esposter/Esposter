<script setup lang="ts">
import { VoiceSettingsSection } from "@/models/message/user/settings/VoiceSettingsSection";
import { useUserSettingsStore } from "@/store/message/user/settings";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <template v-if="userSettings">
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.Devices">
      <MessageModelUserSettingsTypeVoiceDevices :user-settings />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.InputProfile">
      <MessageModelUserSettingsTypeVoiceInputProfile :user-settings />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.InputSensitivity">
      <MessageModelUserSettingsTypeVoiceInputSensitivity :user-settings />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.InputMode">
      <MessageModelUserSettingsTypeVoiceInputMode :user-settings />
    </MessageModelUserSettingsSection>
    <MessageModelUserSettingsSection :title="VoiceSettingsSection.JoinSettings">
      <MessageModelUserSettingsTypeVoiceJoinSwitches :user-settings />
    </MessageModelUserSettingsSection>
  </template>
</template>
