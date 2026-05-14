<script setup lang="ts">
import { CallVirtualBackgroundDefinitions } from "@/services/message/room/call/CallVirtualBackgroundDefinitions";
import { useCallStore } from "@/store/message/room/call";
import { useCallMediaStore } from "@/store/message/room/call/media";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getResultAsync } from "@esposter/shared";
import { mergeProps } from "vue";

const callStore = useCallStore();
const { selectVirtualBackground } = callStore;
const mediaStore = useCallMediaStore();
const { selectedVirtualBackground } = storeToRefs(mediaStore);
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
            icon="mdi-chevron-up"
            size="small"
            variant="plain"
            :ripple="false"
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard py-2 min-w-72>
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
      <v-divider />
      <v-list density="compact">
        <v-list-subheader title="Backgrounds and effects" />
        <div px-3 pb-2 gap-2 grid style="grid-template-columns: repeat(5, 1fr)">
          <button
            v-for="{ imagePath, title } of CallVirtualBackgroundDefinitions"
            :key="title"
            :aria-label="title"
            :style="{ backgroundImage: imagePath ? `url(${imagePath})` : undefined }"
            b-2
            rd
            b-solid
            bg-surface
            aspect-square
            bg-cover
            bg-center
            :class="selectedVirtualBackground === imagePath ? 'b-primary' : 'b-transparent'"
            @click="selectVirtualBackground(imagePath)"
          >
            <v-icon v-if="!imagePath" icon="mdi-close" size="small" />
          </button>
        </div>
      </v-list>
    </StyledCard>
  </v-menu>
</template>
