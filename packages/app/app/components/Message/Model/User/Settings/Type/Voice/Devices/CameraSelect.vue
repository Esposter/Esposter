<script setup lang="ts">
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const deviceStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId } = storeToRefs(deviceStore);
const { videoInputs } = useDevicesList();
</script>

<template>
  <MessageModelUserSettingsTypeVoiceDevicesDeviceSelect
    v-model="cameraDeviceId"
    :devices="videoInputs"
    label="Camera"
  />
</template>
