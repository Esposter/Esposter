<script setup lang="ts">
import type { VBtn } from "vuetify/components";

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
const buttonProps = computed<VBtn["$props"]>(() => ({
  color: connectionQualityMetadata.value.color ?? connectionStateMetadata.value.color,
  ripple: false,
  size: "default",
  variant: "plain",
}));
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
  <StyledTooltipMenuIconButton
    :button-props
    :icon="connectionQualityMetadata.icon"
    :menu-props="{ closeOnContentClick: false, location: 'top' }"
    :text="`${connectionStateMetadata.title} - ${connectionQualityMetadata.title}`"
  >
    <StyledCard py-2 min-w-72>
      <v-list density="compact">
        <v-list-item
          v-for="{ color, icon, label, title } of healthRows"
          :key="label"
          :prepend-icon="icon"
          :subtitle="title"
          :title="label"
        >
          <template #append>
            <v-icon :color icon="mdi-circle" size="x-small" />
          </template>
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="{ icon, title, value } of deviceRows"
          :key="title"
          :prepend-icon="icon"
          :subtitle="value || 'Default'"
          :title
        />
      </v-list>
    </StyledCard>
  </StyledTooltipMenuIconButton>
</template>
