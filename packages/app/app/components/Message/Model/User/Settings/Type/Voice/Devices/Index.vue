<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId, inputDeviceId, outputDeviceId } = storeToRefs(voiceDeviceSettingsStore);
// One enumeration feeds all three pickers — a call per picker re-enumerates the same device list and
// Registers a devicechange listener of its own for it
const { audioInputs, audioOutputs, videoInputs } = useDevicesList();
</script>

<template>
  <v-row>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
        v-model="inputDeviceId"
        :devices="audioInputs"
        label="Microphone"
      />
    </v-col>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
        v-model="outputDeviceId"
        :devices="audioOutputs"
        label="Speaker"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceVolumeUserVolumeSlider
        field="microphoneVolumePercentage"
        label="Microphone Volume"
        :user-settings
      />
    </v-col>
    <v-col cols="6">
      <MessageModelUserSettingsTypeVoiceVolumeUserVolumeSlider
        field="speakerVolumePercentage"
        label="Speaker Volume"
        :user-settings
      />
    </v-col>
  </v-row>
  <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
    v-model="cameraDeviceId"
    mt-2
    :devices="videoInputs"
    label="Camera"
  />
  <MessageModelUserSettingsTypeVoiceMicTest />
</template>
