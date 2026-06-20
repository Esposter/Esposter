<script setup lang="ts">
import { useUserSettingsStore } from "@/store/message/user/settings";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <v-container v-if="userSettings" fluid>
    <div font-bold mb-4 text-title-medium>Voice & Video</div>
    <MessageModelUserSettingsTypeVoiceInputMode :user-settings />
    <v-divider my-4 />
    <MessageModelUserSettingsTypeVoiceInputSensitivitySlider :user-settings />
    <v-divider my-4 />
    <MessageModelUserSettingsTypeVoiceDeviceSelectList />
    <v-divider my-4 />
    <MessageModelUserSettingsTypeVoiceJoinSwitches :user-settings />
    <v-divider my-4 />
    <MessageModelUserSettingsTypeVoiceDefaultVolumeSlider :user-settings />
  </v-container>
</template>
