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
  <!-- Discord's two columns: what you say on the left, what you hear on the right, each with its volume under it -->
  <div gap-4 grid md:cols-2>
    <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
      v-model="inputDeviceId"
      :devices="audioInputs"
      label="Microphone"
    />
    <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
      v-model="outputDeviceId"
      :devices="audioOutputs"
      label="Speaker"
    />
    <MessageModelUserSettingsTypeVoiceVolumeUserVolumeSlider
      field="microphoneVolumePercentage"
      label="Microphone volume"
      :user-settings
    />
    <MessageModelUserSettingsTypeVoiceVolumeUserVolumeSlider
      field="speakerVolumePercentage"
      label="Speaker volume"
      :user-settings
    />
    <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
      v-model="cameraDeviceId"
      :devices="videoInputs"
      label="Camera"
    />
  </div>
  <MessageModelUserSettingsTypeVoiceMicrophoneTest />
</template>
