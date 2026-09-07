<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

interface Props {
  devices: MediaDeviceInfo[];
  label: string;
}

const { devices, label } = defineProps<Props>();
const modelValue = defineModel<string>({ required: true });
const items = computed<SelectItemCategoryDefinition<string>[]>(() =>
  devices.map((device) => ({ title: device.label || device.deviceId, value: device.deviceId })),
);
</script>

<template>
  <v-select v-model="modelValue" density="comfortable" :items :label />
</template>
