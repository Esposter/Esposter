<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";

const callStore = useCallStore();
const { selectVirtualBackground } = callStore;
const mediaStore = useMediaStore();
const { selectedVirtualBackground } = storeToRefs(mediaStore);
const liveKitStore = useLiveKitStore();
const { setActiveDevice } = liveKitStore;
const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId } = storeToRefs(voiceDeviceSettingsStore);
const { deviceSections, isMenuOpen } = useCallDeviceSettings([
  {
    kind: "videoinput",
    selectedId: cameraDeviceId,
    title: "Camera",
  },
]);
</script>

<template>
  <StyledTooltipMenuIconButton
    v-model="isMenuOpen"
    :button-props="{ ripple: false, size: 'small', variant: 'plain' }"
    icon="mdi-chevron-up"
    :menu-props="{ closeOnContentClick: false, location: 'top' }"
    text="Video Settings"
  >
    <StyledCard py-2 min-w-72>
      <MessageContentCallDeviceSectionList :sections="deviceSections" @select="setActiveDevice" />
      <v-divider />
      <MessageContentCallVirtualBackgroundGrid :selected-virtual-background @select="selectVirtualBackground" />
    </StyledCard>
  </StyledTooltipMenuIconButton>
</template>
