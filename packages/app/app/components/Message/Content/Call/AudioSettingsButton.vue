<script setup lang="ts">
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getResultAsync } from "@esposter/shared";
import { mergeProps } from "vue";

const liveKitStore = useLiveKitStore();
const { selectedAudioInputDeviceId, selectedAudioOutputDeviceId } = storeToRefs(liveKitStore);
const { readDevices, switchDevice } = liveKitStore;
const menu = ref(false);
const audioInputDevices = ref<MediaDeviceInfo[]>([]);
const audioOutputDevices = ref<MediaDeviceInfo[]>([]);
const getDeviceTitle = (device: MediaDeviceInfo, index: number, title: string) =>
  device.label || `${title} ${index + 1}`;
const refreshDevices = async () => {
  await getResultAsync(async () => {
    const [newAudioInputDevices, newAudioOutputDevices] = await Promise.all([
      readDevices("audioinput"),
      readDevices("audiooutput"),
    ]);
    audioInputDevices.value = newAudioInputDevices;
    audioOutputDevices.value = newAudioOutputDevices;
  })
    .orTee(console.error)
    .unwrapOr(undefined);
};
const selectDevice = async (kind: MediaDeviceKind, deviceId: string) => {
  await getResultAsync(async () => {
    await switchDevice(kind, deviceId);
  })
    .orTee(console.error)
    .unwrapOr(undefined);
};

watch(menu, (isOpen) => {
  if (!isOpen) return;
  refreshDevices();
});
</script>

<template>
  <v-menu v-model="menu" location="top" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Audio Settings">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="mergeProps(menuProps, tooltipProps)"
            icon="mdi-tune-vertical"
            size="default"
            variant="plain"
            :ripple="false"
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard py-2 min-w-72>
      <v-list density="compact">
        <v-list-subheader title="Microphone" />
        <v-list-item
          v-for="(device, index) of audioInputDevices"
          :key="device.deviceId"
          :prepend-icon="device.deviceId === selectedAudioInputDeviceId ? 'mdi-check' : undefined"
          :title="getDeviceTitle(device, index, 'Microphone')"
          @click="selectDevice('audioinput', device.deviceId)"
        />
        <v-list-item v-if="audioInputDevices.length === 0" title="System default" />
      </v-list>
      <v-divider />
      <v-list density="compact">
        <v-list-subheader title="Speakers" />
        <v-list-item
          v-for="(device, index) of audioOutputDevices"
          :key="device.deviceId"
          :prepend-icon="device.deviceId === selectedAudioOutputDeviceId ? 'mdi-check' : undefined"
          :title="getDeviceTitle(device, index, 'Speakers')"
          @click="selectDevice('audiooutput', device.deviceId)"
        />
        <v-list-item v-if="audioOutputDevices.length === 0" title="System default" />
      </v-list>
    </StyledCard>
  </v-menu>
</template>
