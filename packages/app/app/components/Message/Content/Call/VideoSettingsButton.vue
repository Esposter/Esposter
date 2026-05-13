<script setup lang="ts">
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getResultAsync } from "@esposter/shared";
import { mergeProps } from "vue";

const liveKitStore = useLiveKitStore();
const { selectedVideoInputDeviceId } = storeToRefs(liveKitStore);
const { readDevices, switchDevice } = liveKitStore;
const menu = ref(false);
const videoInputDevices = ref<MediaDeviceInfo[]>([]);
const getDeviceTitle = (device: MediaDeviceInfo, index: number) => device.label || `Camera ${index + 1}`;
const refreshDevices = async () => {
  await getResultAsync(async () => {
    videoInputDevices.value = await readDevices("videoinput");
  })
    .orTee(console.error)
    .unwrapOr(undefined);
};
const selectDevice = async (deviceId: string) => {
  await getResultAsync(async () => {
    await switchDevice("videoinput", deviceId);
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
      <v-tooltip text="Video Settings">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="mergeProps(menuProps, tooltipProps)"
            icon="mdi-video-cog"
            size="default"
            variant="plain"
            :ripple="false"
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard min-w-72 py-2>
      <v-list density="compact">
        <v-list-subheader title="Camera" />
        <v-list-item
          v-for="(device, index) of videoInputDevices"
          :key="device.deviceId"
          :prepend-icon="device.deviceId === selectedVideoInputDeviceId ? 'mdi-check' : undefined"
          :title="getDeviceTitle(device, index)"
          @click="selectDevice(device.deviceId)"
        />
        <v-list-item v-if="videoInputDevices.length === 0" title="System default" />
      </v-list>
    </StyledCard>
  </v-menu>
</template>
