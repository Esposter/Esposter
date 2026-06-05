<script setup lang="ts">
import { ConnectionQualityMetadataMap } from "@/services/message/room/liveKit/ConnectionQualityMetadataMap";
import { ConnectionStateMetadataMap } from "@/services/message/room/liveKit/ConnectionStateMetadataMap";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { mergeProps } from "vue";

const liveKitStore = useLiveKitStore();
const {
  connectionQuality,
  connectionState,
  selectedAudioInputDeviceId,
  selectedAudioOutputDeviceId,
  selectedVideoInputDeviceId,
} = storeToRefs(liveKitStore);
const connectionQualityMetadata = computed(() => ConnectionQualityMetadataMap[connectionQuality.value]);
const connectionStateMetadata = computed(() => ConnectionStateMetadataMap[connectionState.value]);
const title = computed(() => `${connectionStateMetadata.value.title} - ${connectionQualityMetadata.value.title}`);
</script>

<template>
  <v-menu location="top" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip :text="title">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="mergeProps(menuProps, tooltipProps)"
            :color="connectionQualityMetadata.color ?? connectionStateMetadata.color"
            :icon="connectionQualityMetadata.icon"
            size="default"
            variant="plain"
            :ripple="false"
          />
        </template>
      </v-tooltip>
    </template>
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
        <v-list-item
          prepend-icon="mdi-microphone"
          :subtitle="selectedAudioInputDeviceId || 'Default'"
          title="Microphone"
        />
        <v-list-item prepend-icon="mdi-speaker" :subtitle="selectedAudioOutputDeviceId || 'Default'" title="Speakers" />
        <v-list-item prepend-icon="mdi-video" :subtitle="selectedVideoInputDeviceId || 'Default'" title="Camera" />
      </v-list>
    </StyledCard>
  </v-menu>
</template>
