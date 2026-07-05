<script setup lang="ts">
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

const liveKitStore = useLiveKitStore();
const { setActiveDevice } = liveKitStore;
const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
const { inputDeviceId, outputDeviceId } = storeToRefs(voiceDeviceSettingsStore);
const menu = ref(false);
const { deviceSections: audioDeviceSections, refreshDevices } = useCallDeviceSettings([
  {
    kind: "audioinput",
    selectedId: inputDeviceId,
    title: "Microphone",
  },
  {
    kind: "audiooutput",
    selectedId: outputDeviceId,
    title: "Speakers",
  },
]);

watch(menu, async (isOpen) => {
  if (!isOpen) return;
  await refreshDevices();
});
</script>

<template>
  <StyledTooltipMenuIconButton
    v-model="menu"
    :button-props="{ ripple: false, size: 'small', variant: 'plain' }"
    icon="mdi-chevron-up"
    :menu-props="{ closeOnContentClick: false, location: 'top' }"
    text="Audio Settings"
  >
    <StyledCard py-2 min-w-72>
      <MessageContentCallDeviceSectionList :sections="audioDeviceSections" @select="setActiveDevice" />
    </StyledCard>
  </StyledTooltipMenuIconButton>
</template>
