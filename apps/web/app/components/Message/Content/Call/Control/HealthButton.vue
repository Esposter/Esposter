<script setup lang="ts">
import type { UiStatus } from "@/models/ui/UiStatus";

import { MediaDeviceKindMetadataMap } from "@/services/message/room/call/MediaDeviceKindMetadataMap";
import { ConnectionQualityMetadataMap } from "@/services/message/room/liveKit/ConnectionQualityMetadataMap";
import { ConnectionStateMetadataMap } from "@/services/message/room/liveKit/ConnectionStateMetadataMap";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";

const liveKitStore = useLiveKitStore();
const { connectionQuality, connectionState } = storeToRefs(liveKitStore);
const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
const { cameraDeviceId, inputDeviceId, outputDeviceId } = storeToRefs(voiceDeviceSettingsStore);
const connectionQualityMetadata = computed(() => ConnectionQualityMetadataMap[connectionQuality.value]);
const connectionStateMetadata = computed(() => ConnectionStateMetadataMap[connectionState.value]);
// A status is one of the palette's tokens, named as its custom property
const getStatusColor = (status?: UiStatus) => (status ? `var(--ui-${status})` : undefined);
const healthRows = computed(() => [
  { ...connectionStateMetadata.value, label: "Connection" },
  { ...connectionQualityMetadata.value, label: "Quality" },
]);
const deviceRows = computed(() => [
  { ...MediaDeviceKindMetadataMap.audioinput, value: inputDeviceId.value },
  { ...MediaDeviceKindMetadataMap.audiooutput, value: outputDeviceId.value },
  { ...MediaDeviceKindMetadataMap.videoinput, value: cameraDeviceId.value },
]);
</script>

<template>
  <UiPopover :label="`${connectionStateMetadata.title} - ${connectionQualityMetadata.title}`" px-0>
    <template #trigger>
      <span
        :class="connectionQualityMetadata.icon"
        :style="{ color: getStatusColor(connectionQualityMetadata.status ?? connectionStateMetadata.status) }"
        size-6
      />
    </template>
    <div w="[min(20rem,80dvw)]" flex flex-col>
      <p text-sm text-muted px-2>Health</p>
      <div v-for="{ icon, label, status, title } of healthRows" :key="label" ui-row>
        <UiItemContent :description="title" :icon :title="label">
          <template #append>
            <span
              :style="{ backgroundColor: getStatusColor(status) }"
              aria-hidden="true"
              bg-border
              shrink-0
              size-2
              ui-pill
            />
          </template>
        </UiItemContent>
      </div>
      <p text-sm text-muted px-2 pt-2>Devices</p>
      <div v-for="{ icon, title, value } of deviceRows" :key="title" ui-row>
        <UiItemContent :description="value || 'Default'" :icon :title />
      </div>
    </div>
  </UiPopover>
</template>
