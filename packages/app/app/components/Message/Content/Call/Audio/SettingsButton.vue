<script setup lang="ts">
import type { DeviceSection } from "@/models/message/room/call/DeviceSection";

import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getResultAsync, noop } from "@esposter/shared";
import { mergeProps } from "vue";

const liveKitStore = useLiveKitStore();
const { selectedAudioInputDeviceId, selectedAudioOutputDeviceId } = storeToRefs(liveKitStore);
const { readDevices, switchDevice } = liveKitStore;
const menu = ref(false);
const audioInputDevices = ref<MediaDeviceInfo[]>([]);
const audioOutputDevices = ref<MediaDeviceInfo[]>([]);
const audioDeviceSections = computed<DeviceSection[]>(() => [
  {
    devices: audioInputDevices.value,
    kind: "audioinput",
    selectedId: selectedAudioInputDeviceId.value,
    title: "Microphone",
  },
  {
    devices: audioOutputDevices.value,
    kind: "audiooutput",
    selectedId: selectedAudioOutputDeviceId.value,
    title: "Speakers",
  },
]);
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
      <MessageContentCallDeviceSectionList :sections="audioDeviceSections" @select="selectDevice" />
    </StyledCard>
  </v-menu>
</template>
