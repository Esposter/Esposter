<script setup lang="ts">
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const deviceStore = useVoiceDeviceSettingsStore();
const { inputDeviceId } = storeToRefs(deviceStore);
const { audioInputs } = useDevicesList();
</script>

<template>
  <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
    v-model="inputDeviceId"
    :devices="audioInputs"
    label="Microphone"
  />
</template>
