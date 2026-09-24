<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
const { deviceSections, isMenuOpen } = useCallDeviceSettings([{ kind: "videoinput", selectedId: cameraDeviceId }]);
</script>

<template>
  <UiPopover v-model:is-open="isMenuOpen" label="Video Settings" :variant="UiButtonVariant.Quiet" px-0>
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Dropdown" rotate-180 />
    </template>
    <div w="[min(20rem,80dvw)]" flex flex-col gap-3>
      <MessageContentCallDeviceSectionList :sections="deviceSections" @select="setActiveDevice" />
      <MessageContentCallVirtualBackgroundGrid :selected-virtual-background @select="selectVirtualBackground" />
    </div>
  </UiPopover>
</template>
