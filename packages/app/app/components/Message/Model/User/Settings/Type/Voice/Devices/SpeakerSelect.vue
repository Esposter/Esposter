<script setup lang="ts">
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const deviceStore = useVoiceDeviceSettingsStore();
const { outputDeviceId } = storeToRefs(deviceStore);
const { audioOutputs } = useDevicesList();
</script>

<template>
  <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
    v-model="outputDeviceId"
    :devices="audioOutputs"
    label="Speaker"
  />
</template>
