<script setup lang="ts">
import type { DeviceSection } from "@/models/message/room/call/DeviceSection";

import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getResultAsync, noop } from "@esposter/shared";
import { mergeProps } from "vue";

const callStore = useCallStore();
const { selectVirtualBackground } = callStore;
const mediaStore = useMediaStore();
const { selectedVirtualBackground } = storeToRefs(mediaStore);
const liveKitStore = useLiveKitStore();
const { selectedVideoInputDeviceId } = storeToRefs(liveKitStore);
const { readDevices, switchDevice } = liveKitStore;
const menu = ref(false);
const videoInputDevices = ref<MediaDeviceInfo[]>([]);
const videoDeviceSections = computed<DeviceSection[]>(() => [
  {
    devices: videoInputDevices.value,
    kind: "videoinput",
    selectedId: selectedVideoInputDeviceId.value,
    title: "Camera",
  },
]);
const refreshDevices = async () => {
  await getResultAsync(async () => {
    videoInputDevices.value = await readDevices("videoinput");
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
      <v-tooltip text="Video Settings">
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
      <MessageContentCallDeviceSectionList :sections="videoDeviceSections" @select="selectDevice" />
      <v-divider />
      <MessageContentCallVirtualBackgroundGrid :selected-virtual-background @select="selectVirtualBackground" />
    </StyledCard>
  </v-menu>
</template>
