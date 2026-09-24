<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  devices: MediaDeviceInfo[];
  label: string;
}

const { devices, label } = defineProps<Props>();
const modelValue = defineModel<string>({ required: true });
// A device the browser has not been given permission to name reads as its id
const items = computed(() =>
  devices.map((device) => ({
    meaning: UiIconMeaning.Device,
    title: device.label || device.deviceId,
    value: device.deviceId,
  })),
);
</script>

<template>
  <UiSelect v-model="modelValue" :items :label />
</template>
