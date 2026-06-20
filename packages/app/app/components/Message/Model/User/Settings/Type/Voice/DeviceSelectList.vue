<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const deviceStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId, inputDeviceId, outputDeviceId } = storeToRefs(deviceStore);
const { audioInputs, audioOutputs, videoInputs } = useDevicesList();
const toItems = (devices: MediaDeviceInfo[]): SelectItemCategoryDefinition<string>[] =>
  devices.map((device) => ({ title: device.label || device.deviceId, value: device.deviceId }));
const audioInputItems = computed(() => toItems(audioInputs.value));
const audioOutputItems = computed(() => toItems(audioOutputs.value));
const videoInputItems = computed(() => toItems(videoInputs.value));
</script>

<template>
  <v-select
    v-model="inputDeviceId"
    density="comfortable"
    :items="audioInputItems"
    label="Input Device"
    hide-details
    mb-4
  />
  <v-select
    v-model="outputDeviceId"
    density="comfortable"
    :items="audioOutputItems"
    label="Output Device"
    hide-details
    mb-4
  />
  <v-select v-model="cameraDeviceId" density="comfortable" :items="videoInputItems" label="Camera" hide-details />
</template>
