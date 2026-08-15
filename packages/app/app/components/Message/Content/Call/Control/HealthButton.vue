<script setup lang="ts">
import type { VBtn } from "vuetify/components";

import { ConnectionQualityMetadataMap } from "@/services/message/room/liveKit/ConnectionQualityMetadataMap";
import { ConnectionStateMetadataMap } from "@/services/message/room/liveKit/ConnectionStateMetadataMap";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";

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
          :prepend-icon="connectionStateMetadata.icon"
          :subtitle="connectionStateMetadata.title"
          title="Connection"
        >
          <template #append>
            <v-icon :color="connectionStateMetadata.color" icon="mdi-circle" size="x-small" />
          </template>
        </v-list-item>
        <v-list-item
          :prepend-icon="connectionQualityMetadata.icon"
          :subtitle="connectionQualityMetadata.title"
          title="Quality"
        >
          <template #append>
            <v-icon :color="connectionQualityMetadata.color" icon="mdi-circle" size="x-small" />
          </template>
        </v-list-item>
        <v-divider />
        <v-list-item prepend-icon="mdi-microphone" :subtitle="inputDeviceId || 'Default'" title="Microphone" />
        <v-list-item prepend-icon="mdi-speaker" :subtitle="outputDeviceId || 'Default'" title="Speakers" />
        <v-list-item prepend-icon="mdi-video" :subtitle="cameraDeviceId || 'Default'" title="Camera" />
      </v-list>
    </StyledCard>
  </StyledTooltipMenuIconButton>
</template>
