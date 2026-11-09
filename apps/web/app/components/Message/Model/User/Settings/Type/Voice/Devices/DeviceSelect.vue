<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  devices: MediaDeviceInfo[];
  label: string;
}

const modelValue = defineModel<string>({ required: true });
const { devices } = defineProps<Props>();
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
