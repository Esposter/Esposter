<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const deviceStore = useVoiceDeviceSettingsStore();
const { inputDeviceId } = storeToRefs(deviceStore);
const { audioInputs } = useDevicesList();
const audioInputItems = computed<SelectItemCategoryDefinition<string>[]>(() =>
  audioInputs.value.map((device) => ({ title: device.label || device.deviceId, value: device.deviceId })),
);
</script>

<template>
  <v-select v-model="inputDeviceId" density="comfortable" :items="audioInputItems" label="Microphone" hide-details />
</template>
