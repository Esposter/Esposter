<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRealtimeStore } from "@/store/message/room/realtime";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";

const realtimeStore = useRealtimeStore();
const { setActiveDevice } = realtimeStore;
const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
const { inputDeviceId, outputDeviceId } = storeToRefs(voiceDeviceSettingsStore);
const { deviceSections, isMenuOpen } = useCallDeviceSettings([
  { kind: "audioinput", selectedId: inputDeviceId },
  { kind: "audiooutput", selectedId: outputDeviceId },
]);
</script>

<template>
  <UiPopover v-model:is-open="isMenuOpen" label="Audio Settings" :variant="UiButtonVariant.Quiet" px-0>
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Dropdown" rotate-180 />
    </template>
    <div w="[min(20rem,80dvw)]" flex flex-col gap-2>
      <MessageContentCallDeviceSectionList
        :sections="deviceSections"
        @select="(kind, deviceId) => setActiveDevice(kind, deviceId)"
      />
    </div>
  </UiPopover>
</template>
