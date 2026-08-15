<script setup lang="ts">
interface DeviceSelectProps {
  devices: MediaDeviceInfo[];
  label: string;
}

const { devices, label } = defineProps<DeviceSelectProps>();
const modelValue = defineModel<string>({ required: true });
</script>

<template>
  <v-select
    v-model="modelValue"
    density="comfortable"
    :items="devices.map((device) => ({ title: device.label || device.deviceId, value: device.deviceId }))"
    :label
    hide-details
  />
</template>
