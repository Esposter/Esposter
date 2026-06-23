<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";
import { mergeProps } from "vue";

const callStore = useCallStore();
const { selectVirtualBackground } = callStore;
const mediaStore = useMediaStore();
const { selectedVirtualBackground } = storeToRefs(mediaStore);
const liveKitStore = useLiveKitStore();
const { setActiveDevice } = liveKitStore;
const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId } = storeToRefs(voiceDeviceSettingsStore);
const menu = ref(false);
const { deviceSections, refreshDevices } = useCallDeviceSettings([
  {
    kind: "videoinput",
    selectedId: cameraDeviceId,
    title: "Camera",
  },
]);

watch(menu, async (isOpen) => {
  if (!isOpen) return;
  await refreshDevices();
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
      <MessageContentCallDeviceSectionList :sections="deviceSections" @select="setActiveDevice" />
      <v-divider />
      <MessageContentCallVirtualBackgroundGrid :selected-virtual-background @select="selectVirtualBackground" />
    </StyledCard>
  </v-menu>
</template>
