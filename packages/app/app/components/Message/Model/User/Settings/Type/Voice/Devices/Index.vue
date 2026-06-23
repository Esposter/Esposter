<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

interface DevicesProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<DevicesProps>();
</script>

<template>
  <v-row>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceDevicesMicrophoneSelect />
    </v-col>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceDevicesSpeakerSelect />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceVolumeMicrophoneVolumeSlider :user-settings />
    </v-col>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceVolumeSpeakerVolumeSlider :user-settings />
    </v-col>
  </v-row>
  <MessageModelUserSettingsTypeVoiceDevicesCameraSelect mt-2 />
  <MessageModelUserSettingsTypeVoiceMicTest />
</template>
