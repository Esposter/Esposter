<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const deviceStore = useVoiceDeviceSettingsStore();
const { outputDeviceId } = storeToRefs(deviceStore);
const { audioOutputs } = useDevicesList();
const audioOutputItems = computed<SelectItemCategoryDefinition<string>[]>(() =>
  audioOutputs.value.map((device) => ({ title: device.label || device.deviceId, value: device.deviceId })),
);
</script>

<template>
  <v-select v-model="outputDeviceId" density="comfortable" :items="audioOutputItems" label="Speaker" hide-details />
</template>
