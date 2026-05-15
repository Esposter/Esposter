<script setup lang="ts">
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { mergeProps } from "vue";

const liveKitStore = useLiveKitStore();
const { selectedAudioInputDeviceId, selectedAudioOutputDeviceId } = storeToRefs(liveKitStore);
const menu = ref(false);
const {
  deviceSections: audioDeviceSections,
  refreshDevices,
  selectDevice,
} = useCallDeviceSettings([
  {
    kind: "audioinput",
    selectedId: selectedAudioInputDeviceId,
    title: "Microphone",
  },
  {
    kind: "audiooutput",
    selectedId: selectedAudioOutputDeviceId,
    title: "Speakers",
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
