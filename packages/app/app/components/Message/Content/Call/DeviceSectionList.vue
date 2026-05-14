<script setup lang="ts">
import type { DeviceSection } from "@/models/message/room/call/DeviceSection";

interface CallDeviceSectionListProps {
  sections: DeviceSection[];
}

const { sections } = defineProps<CallDeviceSectionListProps>();
const emit = defineEmits<{ select: [kind: MediaDeviceKind, deviceId: string] }>();
const getDeviceTitle = (device: MediaDeviceInfo, index: number, title: string) =>
  device.label || `${title} ${index + 1}`;
</script>

<template>
  <template v-for="({ devices, kind, selectedId, title }, sectionIndex) of sections" :key="kind">
    <v-divider v-if="sectionIndex > 0" />
    <v-list density="compact">
      <v-list-subheader :title />
      <v-list-item
        v-for="(device, index) of devices"
        :key="device.deviceId"
        :prepend-icon="device.deviceId === selectedId ? 'mdi-check' : undefined"
        :title="getDeviceTitle(device, index, title)"
        @click="emit('select', kind, device.deviceId)"
      />
      <v-list-item v-if="devices.length === 0" title="System default" />
    </v-list>
  </template>
</template>
