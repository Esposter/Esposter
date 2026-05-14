<script setup lang="ts">
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getResultAsync, noop } from "@esposter/shared";
import { mergeProps } from "vue";

const liveKitStore = useLiveKitStore();
const { selectedAudioInputDeviceId, selectedAudioOutputDeviceId } = storeToRefs(liveKitStore);
const { readDevices, switchDevice } = liveKitStore;
const menu = ref(false);
const audioInputDevices = ref<MediaDeviceInfo[]>([]);
const audioOutputDevices = ref<MediaDeviceInfo[]>([]);
const audioDeviceSections = computed(() => [
  {
    kind: "audioinput" as MediaDeviceKind,
    title: "Microphone",
    devices: audioInputDevices.value,
    selectedId: selectedAudioInputDeviceId.value,
  },
  {
    kind: "audiooutput" as MediaDeviceKind,
    title: "Speakers",
    devices: audioOutputDevices.value,
    selectedId: selectedAudioOutputDeviceId.value,
  },
]);
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
  }).match(noop, console.error);
};
const selectDevice = async (kind: MediaDeviceKind, deviceId: string) => {
  await getResultAsync(async () => {
    await switchDevice(kind, deviceId);
  }).match(noop, console.error);
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
            icon="mdi-chevron-up"
            size="small"
            variant="plain"
            :ripple="false"
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard py-2 min-w-72>
      <template v-for="({ devices, kind, selectedId, title }, sectionIndex) of audioDeviceSections" :key="kind">
        <v-divider v-if="sectionIndex > 0" />
        <v-list density="compact">
          <v-list-subheader :title />
          <v-list-item
            v-for="(device, index) of devices"
            :key="device.deviceId"
            :prepend-icon="device.deviceId === selectedId ? 'mdi-check' : undefined"
            :title="getDeviceTitle(device, index, title)"
            @click="selectDevice(kind, device.deviceId)"
          />
          <v-list-item v-if="devices.length === 0" title="System default" />
        </v-list>
      </template>
    </StyledCard>
  </v-menu>
</template>
