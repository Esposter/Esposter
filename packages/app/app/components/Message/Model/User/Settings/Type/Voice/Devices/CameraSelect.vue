<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const deviceStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId } = storeToRefs(deviceStore);
const { videoInputs } = useDevicesList();
const videoInputItems = computed<SelectItemCategoryDefinition<string>[]>(() =>
  videoInputs.value.map((device) => ({ title: device.label || device.deviceId, value: device.deviceId })),
);
</script>

<template>
  <v-select v-model="cameraDeviceId" density="comfortable" :items="videoInputItems" label="Camera" hide-details />
</template>
