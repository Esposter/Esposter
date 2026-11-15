<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";
import { useMediaStore } from "#src/store/message/room/call/media";
import { useRealtimeStore } from "#src/store/message/room/realtime";
import { useVoiceDeviceSettingsStore } from "#src/store/message/user/settings/voiceDevice";

const callStore = useCallStore();
const { selectVirtualBackground } = callStore;
const mediaStore = useMediaStore();
const { selectedVirtualBackground } = storeToRefs(mediaStore);
const realtimeStore = useRealtimeStore();
const { setActiveDevice } = realtimeStore;
const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId } = storeToRefs(voiceDeviceSettingsStore);
const { deviceSections, isMenuOpen } = useCallDeviceSettings([{ kind: "videoinput", selectedId: cameraDeviceId }]);
</script>

<template>
  <UiPopover v-model:is-open="isMenuOpen" label="Video Settings" :variant="UiButtonVariant.Quiet" px-0>
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Dropdown" rotate-180 />
    </template>
    <div w="[min(20rem,80dvw)]" flex flex-col gap-3>
      <MessageContentCallDeviceSectionList
        :sections="deviceSections"
        @select="(kind, deviceId) => setActiveDevice(kind, deviceId)"
      />
      <MessageContentCallVirtualBackgroundGrid
        :selected-virtual-background
        @select="(virtualBackground) => selectVirtualBackground(virtualBackground)"
      />
    </div>
  </UiPopover>
</template>
